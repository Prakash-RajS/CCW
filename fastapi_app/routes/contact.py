#fastapi_app/routes/contact.py
import os
import smtplib
import asyncio
from pathlib import Path
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# ------------------------------------------------------------------
# Load environment variables
# ------------------------------------------------------------------
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
EMAIL_FROM = os.getenv("EMAIL_FROM")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", EMAIL_FROM)

if not all([SMTP_USER, SMTP_PASS, EMAIL_FROM]):
    pass
    #print("⚠️  SMTP credentials missing in .env – email sending will fail")

router = APIRouter(prefix="/api", tags=["Contact"])

# ------------------------------------------------------------------
# Pydantic Model
# ------------------------------------------------------------------
class ContactForm(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    message: str

    @validator("phone")
    def validate_phone(cls, v):
        if not v.isdigit() or len(v) != 10:
            raise ValueError("Phone number must be exactly 10 digits")
        return v

# ------------------------------------------------------------------
# Email HTML Builder
# ------------------------------------------------------------------
def build_email_html(
    title: str,
    greeting: str,
    sections: list,          # list of (label, value)
    message: str = None,
    footer_text: str = None,
) -> str:
    """
    Generate a beautiful, brand‑consistent HTML email.
    """
    # Build the sections table
    rows_html = "".join(
        f"""
        <tr>
            <td style="padding: 8px 12px; font-size: 14px; font-weight: 600; color: #4C2E81; border-bottom: 1px solid #f0e6ff; width: 35%;">{label}</td>
            <td style="padding: 8px 12px; font-size: 14px; color: #333; border-bottom: 1px solid #f0e6ff;">{value}</td>
        </tr>
        """
        for label, value in sections
    )

    message_html = ""
    if message:
        message_html = f"""
        <div style="background: #f9f6ff; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #7B2FBE; margin-top: 16px;">
            <p style="margin: 0; font-size: 14px; color: #333; white-space: pre-wrap;">{message}</p>
        </div>
        """

    footer = footer_text or "© Talenta – All rights reserved."

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
    </head>
    <body style="margin:0; padding:0; background:#f4f1fb; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; margin: 30px auto; border-radius: 20px; box-shadow: 0 8px 30px rgba(76, 46, 129, 0.12);">
            <!-- HEADER -->
            <tr>
                <td style="background: linear-gradient(135deg, #6D2EFF, #120026); padding: 30px 30px 20px; border-radius: 20px 20px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">
                        Talenta
                    </h1>
                    <p style="margin: 6px 0 0; font-size: 14px; color: #d9c9ff;">Empowering Creators & Collaborators</p>
                </td>
            </tr>
            <!-- BODY -->
            <tr>
                <td style="padding: 30px 30px 20px;">
                    <p style="font-size: 18px; font-weight: 600; color: #4C2E81; margin: 0 0 8px;">{greeting}</p>
                    <p style="font-size: 14px; color: #555; margin: 0 0 20px;">We received the following details:</p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        <tbody>
                            {rows_html}
                        </tbody>
                    </table>

                    {message_html}
                </td>
            </tr>
            <!-- FOOTER -->
            <tr>
                <td style="background: #f8f5ff; padding: 20px 30px; border-radius: 0 0 20px 20px; text-align: center; font-size: 13px; color: #6b6b6b; border-top: 1px solid #ece3ff;">
                    {footer}
                    <br />
                    <span style="font-size: 12px; color: #a89ac2;">This is an automated message, please do not reply.</span>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

# ------------------------------------------------------------------
# Email Helpers
# ------------------------------------------------------------------
async def send_email(recipient: str, subject: str, html_body: str, text_body: Optional[str] = None) -> bool:
    """Send an email via smtplib with STARTTLS, wrapped in a thread."""
    if not SMTP_USER or not SMTP_PASS:
        # print("❌ SMTP not configured")
        return False

    msg = MIMEMultipart("alternative")
    msg["From"] = EMAIL_FROM
    msg["To"] = recipient
    msg["Subject"] = subject

    if text_body:
        part_text = MIMEText(text_body, "plain")
        msg.attach(part_text)
    part_html = MIMEText(html_body, "html")
    msg.attach(part_html)

    def _send_sync() -> bool:
        try:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
            return True
        except Exception as e:
            # print(f"❌ Email sending failed to {recipient}: {e}")
            return False

    return await asyncio.to_thread(_send_sync)


async def send_admin_email(form: ContactForm):
    subject = f"New Contact Form Submission from {form.firstName} {form.lastName}"

    sections = [
        ("Full Name", f"{form.firstName} {form.lastName}"),
        ("Email", form.email),
        ("Phone", form.phone),
        ("Submitted", datetime.now().strftime("%B %d, %Y at %I:%M %p")),
    ]

    html = build_email_html(
        title=subject,
        greeting="📬 New Contact Form Submission",
        sections=sections,
        message=form.message,
        footer_text="Talenta Admin – You received this because someone filled the contact form on your website.",
    )
    text = f"""
    New Contact Form Submission
    Name: {form.firstName} {form.lastName}
    Email: {form.email}
    Phone: {form.phone}
    Message: {form.message}
    """
    return await send_email(ADMIN_EMAIL, subject, html, text)


async def send_user_thankyou(form: ContactForm):
    subject = "Thank You for Contacting Talenta!"
    sections = [
        ("Name", f"{form.firstName} {form.lastName}"),
        ("Email", form.email),
        ("Phone", form.phone),
    ]
    html = build_email_html(
        title=subject,
        greeting=f"👋 Hello {form.firstName},",
        sections=sections,
        message=form.message,
        footer_text="We'll get back to you within 24 hours. In the meantime, feel free to explore Talenta.",
    )
    text = f"""
    Hello {form.firstName},
    Thank you for contacting Talenta. We have received your message and will get back to you shortly.
    Your message: {form.message}
    """
    return await send_email(form.email, subject, html, text)


# ------------------------------------------------------------------
# API Endpoint
# ------------------------------------------------------------------
@router.post("/contact")
async def contact_form(form: ContactForm, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_admin_email, form)
    background_tasks.add_task(send_user_thankyou, form)

    return {
        "success": True,
        "message": "Your message has been sent. We'll get back to you soon."
    }