"""
fastapi_app/services/invoice_service.py

Modern PDF invoice generation using WeasyPrint.
Saves PDF to media/invoices/ and creates an Invoice DB record.
"""

import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone as dt_timezone
from pathlib import Path
from typing import Optional

import django
from django.conf import settings
from django.core.mail import EmailMessage
import pytz



logger = logging.getLogger(__name__)

# =========================================================
# PATHS
# =========================================================

TEMPLATE_PATH = (
    Path(__file__).resolve().parent.parent
    / "templates"
    / "invoice_template.html"
)

INVOICE_SAVE_DIR = (
    Path(__file__).resolve().parent.parent
    / "media"
    / "invoices"
)


def _ensure_invoice_dir() -> Path:
    INVOICE_SAVE_DIR.mkdir(parents=True, exist_ok=True)
    return INVOICE_SAVE_DIR


from fastapi_app.routes.storage import (
    USE_S3,
    save_bytes_content_sync,
    invoice_path,
)


# =========================================================
# TIMEZONE HELPER
# =========================================================

def get_user_timezone(user) -> dt_timezone:
    """Get timezone from user's location. Returns India timezone as default."""
    default_tz = pytz.timezone('Asia/Kolkata')
    
    try:
        location = getattr(user, 'location', '') or ''
        
        location_tz_map = {
            'india': 'Asia/Kolkata',
            'mumbai': 'Asia/Kolkata',
            'delhi': 'Asia/Kolkata',
            'chennai': 'Asia/Kolkata',
            'kolkata': 'Asia/Kolkata',
            'bangalore': 'Asia/Kolkata',
            'hyderabad': 'Asia/Kolkata',
            'pune': 'Asia/Kolkata',
            'ahmedabad': 'Asia/Kolkata',
            'new york': 'America/New_York',
            'los angeles': 'America/Los_Angeles',
            'chicago': 'America/Chicago',
            'london': 'Europe/London',
            'dubai': 'Asia/Dubai',
            'singapore': 'Asia/Singapore',
        }
        
        location_lower = location.lower()
        for key, tz_name in location_tz_map.items():
            if key in location_lower:
                return pytz.timezone(tz_name)
        
        city = getattr(user, 'city', '') or ''
        state = getattr(user, 'state', '') or ''
        
        city_lower = city.lower()
        state_lower = state.lower()
        
        for key, tz_name in location_tz_map.items():
            if key in city_lower or key in state_lower:
                return pytz.timezone(tz_name)
        
        return default_tz
        
    except Exception as exc:
        logger.warning(f"Error getting user timezone: {exc}, using default IST")
        return default_tz


def get_localized_now(user) -> datetime:
    """Get current datetime in user's local timezone."""
    user_tz = get_user_timezone(user)
    return datetime.now(user_tz)


# =========================================================
# BUILD CONTEXT
# =========================================================

def build_invoice_context(
    *,
    user,
    plan,
    amount_paid: float,
    duration_display: str,
    invoice_number: str,
    order_id: str,
    invoice_date: Optional[datetime] = None,
) -> dict:

    if invoice_date:
        if invoice_date.tzinfo is None:
            invoice_date = pytz.UTC.localize(invoice_date)
    else:
        invoice_date = get_localized_now(user)

    is_annual = any(
        x in duration_display.lower()
        for x in ["year", "annual", "annually"]
    )

    period_end = invoice_date + timedelta(
        days=365 if is_annual else 30
    )

    original_price = float(plan.price)

    discount_pct = int(
        getattr(plan, "discount_percentage", 0) or 0
    )

    discount_amount = (
        round(original_price - amount_paid, 2)
        if discount_pct else 0
    )

    location_parts = [
        getattr(user, "location", "") or "",
        getattr(user, "city", "") or "",
        getattr(user, "state", "") or "",
    ]

    clean_location = ", ".join(
        [x for x in location_parts if x]
    )

    if not clean_location:
        clean_location = "Tamil Nadu, India"

    date_format = "%B %d, %Y at %I:%M %p"
    formatted_date = invoice_date.strftime(date_format)
    
    if hasattr(invoice_date, 'tzinfo') and invoice_date.tzinfo:
        try:
            tz_abbr = invoice_date.strftime('%Z')
            if tz_abbr:
                formatted_date = f"{formatted_date} {tz_abbr}"
        except:
            pass

    return {
        "client_name": user.full_name or user.email,
        "client_email": user.email,
        "client_phone": getattr(user, "phone_number", "") or "",
        "client_address": getattr(user, "address", "") or "",
        "client_location": clean_location,
        "company_name": "Talenta",
        "company_email": "support@talenta.com",
        "company_website": "www.talenta.com",
        "company_phone": "+91 98765 43210",
        "company_address": "Hosur, Tamil Nadu, India",
        "gst_number": "GSTIN 33AAAAA0000A1Z5",
        "invoice_number": invoice_number or order_id,
        "invoice_date": formatted_date,
        "order_id": order_id,
        "plan_name": plan.name,
        "duration": duration_display,
        "period_start": invoice_date.strftime("%B %d, %Y"),
        "period_end": period_end.strftime("%B %d, %Y"),
        "original_price": f"{original_price:.2f}",
        "subtotal": f"{original_price:.2f}",
        "discount_pct": discount_pct,
        "discount_amount": f"{discount_amount:.2f}",
        "net_payable": f"{amount_paid:.2f}",
        "amount_paid": f"{amount_paid:.2f}",
        "total_amount": f"{original_price:.2f}",
        "tax_amount": "0.00",
    }


# =========================================================
# SIMPLE TEMPLATE RENDERER
# =========================================================

def _render_template(template_path: Path, context: dict) -> str:
    import re

    with open(template_path, "r", encoding="utf-8") as f:
        html = f.read()

    def replace_if(match):
        key = match.group(1).strip()
        content = match.group(2)
        value = context.get(key)
        if value and str(value) not in ("", "0", "0.00", "False", "None"):
            return content
        return ""

    html = re.sub(
        r"\{%\s*if\s+(\w+)\s*%\}(.*?)\{%\s*endif\s*%\}",
        replace_if,
        html,
        flags=re.DOTALL,
    )

    def replace_var(match):
        key = match.group(1).strip()
        return str(context.get(key, ""))

    html = re.sub(r"\{\{\s*(\w+)\s*\}\}", replace_var, html)
    return html


# =========================================================
# GENERATE PDF BYTES
# =========================================================

def generate_invoice_pdf(context: dict) -> bytes:
    from weasyprint import HTML
    html_content = _render_template(TEMPLATE_PATH, context)
    pdf_bytes = HTML(
        string=html_content,
        base_url=str(TEMPLATE_PATH.parent),
    ).write_pdf()
    return pdf_bytes


# =========================================================
# SAVE PDF TO DISK (UPDATED)
# =========================================================

def save_invoice_pdf(pdf_bytes: bytes, invoice_number: str):
    """
    Saves the PDF to S3 or local storage.
    Returns a dict with path and storage_mode.
    """
    from fastapi_app.routes.storage import USE_S3, save_bytes_content_sync, invoice_path
    
    safe_name = "".join(c if c.isalnum() or c in "-_." else "_" for c in invoice_number)
    filename = f"Talenta_Invoice_{safe_name}.pdf"
    
    if USE_S3:
        # ✅ Save to S3
        s3_key = invoice_path(filename)
        save_bytes_content_sync(
            content=pdf_bytes,
            s3_key=s3_key,
            content_type="application/pdf"
        )
        logger.info(f"Invoice PDF saved to S3: {s3_key}")
        return {
            "path": s3_key,
            "storage_mode": "s3"
        }
    else:
        # ✅ Save locally
        save_dir = _ensure_invoice_dir()
        file_path = save_dir / filename
        file_path.write_bytes(pdf_bytes)
        logger.info(f"Invoice PDF saved locally: {file_path}")
        return {
            "path": str(file_path),
            "storage_mode": "local"
        }


# =========================================================
# CREATE INVOICE DB RECORD (UPDATED)
# =========================================================

def create_invoice_record(
    *,
    user,
    subscription,
    invoice_number: str,
    amount_paid: float,
    pdf_save_result: Optional[dict] = None,
):
    """
    Creates or updates an Invoice record in the database.
    pdf_save_result should be a dict with 'path' and 'storage_mode'.
    """
    from creator_app.models import Invoice

    relative_path = None
    if pdf_save_result:
        if pdf_save_result["storage_mode"] == "s3":
            # S3 mode - store the S3 key
            relative_path = pdf_save_result["path"]
        else:
            # Local mode - store relative path to MEDIA_ROOT
            local_path = Path(pdf_save_result["path"])
            if local_path.exists():
                try:
                    relative_path = str(local_path.relative_to(Path(settings.MEDIA_ROOT)))
                except ValueError:
                    relative_path = str(local_path)

    invoice, created = Invoice.objects.update_or_create(
        invoice_number=invoice_number,
        defaults={
            "user": user,
            "subscription": subscription,
            "amount": amount_paid,
            "currency": "inr",
            "status": "paid",
            "paid_date": get_localized_now(user),
            **({"pdf_file": relative_path} if relative_path else {}),
        },
    )
    
    action = "Created" if created else "Updated"
    logger.info("%s Invoice record | invoice=%s | user=%s", action, invoice_number, user.email)
    return invoice


# =========================================================
# SEND EMAIL (UPDATED)
# =========================================================

def send_invoice_email(
    *,
    user,
    plan,
    amount_paid: float,
    duration_display: str,
    invoice_number: str,
    order_id: str,
    invoice_date: Optional[datetime] = None,
    subscription=None,
) -> bool:

    try:
        logger.info(f"📧 Starting invoice email generation for {user.email}")
        logger.info(f"   Invoice: {invoice_number}, Plan: {plan.name}")

        # Build context
        context = build_invoice_context(
            user=user,
            plan=plan,
            amount_paid=amount_paid,
            duration_display=duration_display,
            invoice_number=invoice_number,
            order_id=order_id,
            invoice_date=None,
        )

        # Generate PDF
        pdf_bytes = generate_invoice_pdf(context)
        logger.info(f"✅ PDF generated: {len(pdf_bytes)} bytes")

        # Save PDF to S3 or local
        pdf_save_result = save_invoice_pdf(pdf_bytes, invoice_number)
        logger.info(f"✅ PDF saved: {pdf_save_result}")

        # Create invoice record
        create_invoice_record(
            user=user,
            subscription=subscription,
            invoice_number=invoice_number,
            amount_paid=amount_paid,
            pdf_save_result=pdf_save_result,
        )
        logger.info(f"✅ Invoice record created/updated")

        # Build email
        filename = f"Talenta_Invoice_{invoice_number}.pdf"
        subject = f"Your Talenta Invoice — {plan.name} ({duration_display})"

        localized_now = get_localized_now(user)
        time_str = localized_now.strftime("%B %d, %Y at %I:%M %p")
        if hasattr(localized_now, 'tzinfo') and localized_now.tzinfo:
            try:
                tz_abbr = localized_now.strftime('%Z')
                if tz_abbr:
                    time_str = f"{time_str} {tz_abbr}"
            except:
                pass

        body = f"""Dear {user.full_name or 'Customer'},

Thank you for subscribing to the {plan.name} plan on Talenta.

Your payment has been successfully processed.

Invoice Details:
---------------------------------
Plan       : {plan.name}
Duration   : {duration_display}
Amount     : ₹{amount_paid:.2f}
Invoice No : {invoice_number}
Date       : {time_str}

Please find the invoice attached.

Thank you for choosing Talenta.

Best regards,
Talenta Team
"""

        # Send email with attachment
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@talenta.com"),
            to=[user.email],
        )

        email.attach(filename, pdf_bytes, "application/pdf")
        email.send(fail_silently=False)

        logger.info(f"✅ Invoice email sent successfully to {user.email}")
        return True

    except Exception as exc:
        logger.error(
            "❌ Invoice email failed | user=%s | error=%s",
            getattr(user, "email", "unknown"),
            exc,
            exc_info=True,
        )
        return False


# =========================================================
# ASYNC WRAPPER
# =========================================================

async def send_invoice_email_async(
    *,
    user,
    plan,
    amount_paid: float,
    duration_display: str,
    invoice_number: str,
    order_id: str,
    invoice_date: Optional[datetime] = None,
    subscription=None,
) -> bool:

    loop = asyncio.get_event_loop()

    return await loop.run_in_executor(
        None,
        lambda: send_invoice_email(
            user=user,
            plan=plan,
            amount_paid=amount_paid,
            duration_display=duration_display,
            invoice_number=invoice_number,
            order_id=order_id,
            invoice_date=invoice_date,
            subscription=subscription,
        ),
    )