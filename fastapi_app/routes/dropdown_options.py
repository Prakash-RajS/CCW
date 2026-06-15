# ============================================================
# fastapi_app/routes/dropdown_options.py  — NEW FILE
# ============================================================
import csv
import io
from typing import List, Optional

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

# Django ORM is available because django_setup.py is loaded in main.py
from creator_app.models import DropdownOption

router = APIRouter(prefix="/dropdown-options", tags=["Dropdown Options"])


# ── Pydantic schemas ────────────────────────────────────────────────────────

class OptionOut(BaseModel):
    id: int
    category: str
    label: str
    value: str
    order: int
    is_active: bool

    class Config:
        from_attributes = True


class OptionCreate(BaseModel):
    category: str
    label: str
    value: str
    order: Optional[int] = 0
    is_active: Optional[bool] = True


class OptionUpdate(BaseModel):
    label: Optional[str] = None
    value: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


# ── helpers ─────────────────────────────────────────────────────────────────

VALID_CATEGORIES = {
    'creator_category',
    'primary_niche',
    'secondary_niche',
    'platform',
    'followers_range',
    'portfolio_category',
    'skill_category',
}

def _to_dict(obj: DropdownOption) -> dict:
    return {
        "id":        obj.id,
        "category":  obj.category,
        "label":     obj.label,
        "value":     obj.value,
        "order":     obj.order,
        "is_active": obj.is_active,
    }


# ── PUBLIC endpoint (used by frontend dropdowns) ────────────────────────────

@router.get("/all")
def get_all_options():
    """
    Returns all ACTIVE options grouped by category.
    Called once by the React hook; result is cached client-side.
    Response shape: { "creator_category": [{label, value}, ...], ... }
    """
    qs = DropdownOption.objects.filter(is_active=True).values(
        'category', 'label', 'value', 'order'
    )
    result: dict = {}
    for item in qs:
        cat = item['category']
        if cat not in result:
            result[cat] = []
        result[cat].append({"label": item['label'], "value": item['value']})
    return result


# ── ADMIN endpoints ─────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[OptionOut])
def admin_list_all():
    """All options (including inactive) for admin panel table."""
    return [_to_dict(o) for o in DropdownOption.objects.all()]


@router.get("/admin/{category}", response_model=List[OptionOut])
def admin_list_by_category(category: str):
    """Options for one category — used when admin clicks a category tab."""
    return [_to_dict(o) for o in DropdownOption.objects.filter(category=category)]


@router.post("/admin", response_model=OptionOut)
def admin_create_option(payload: OptionCreate):
    """Create a single option."""
    if payload.category not in VALID_CATEGORIES:
        raise HTTPException(400, f"Invalid category '{payload.category}'")
    if DropdownOption.objects.filter(category=payload.category, value=payload.value).exists():
        raise HTTPException(409, "An option with this category + value already exists")
    obj = DropdownOption.objects.create(
        category  = payload.category,
        label     = payload.label.strip(),
        value     = payload.value.strip().lower().replace(" ", "_"),
        order     = payload.order,
        is_active = payload.is_active,
    )
    return _to_dict(obj)


@router.put("/admin/{option_id}", response_model=OptionOut)
def admin_update_option(option_id: int, payload: OptionUpdate):
    """Update label / value / order / is_active."""
    try:
        obj = DropdownOption.objects.get(id=option_id)
    except DropdownOption.DoesNotExist:
        raise HTTPException(404, "Option not found")

    if payload.label     is not None: obj.label     = payload.label.strip()
    if payload.value     is not None: obj.value     = payload.value.strip().lower()
    if payload.order     is not None: obj.order     = payload.order
    if payload.is_active is not None: obj.is_active = payload.is_active
    obj.save()
    return _to_dict(obj)


@router.delete("/admin/{option_id}")
def admin_delete_option(option_id: int):
    """Hard-delete a single option."""
    try:
        obj = DropdownOption.objects.get(id=option_id)
    except DropdownOption.DoesNotExist:
        raise HTTPException(404, "Option not found")
    obj.delete()
    return {"message": "Deleted successfully"}


@router.patch("/admin/{option_id}/toggle")
def admin_toggle_option(option_id: int):
    """Flip is_active without a full update payload."""
    try:
        obj = DropdownOption.objects.get(id=option_id)
    except DropdownOption.DoesNotExist:
        raise HTTPException(404, "Option not found")
    obj.is_active = not obj.is_active
    obj.save()
    return _to_dict(obj)


# ── Bulk import via CSV/Excel ────────────────────────────────────────────────

@router.post("/admin/bulk-import")
def bulk_import(file: UploadFile = File(...)):
    # Read file content synchronously
    content = file.file.read()
    
    # Handle BOM and decode properly
    try:
        # Try UTF-8 with BOM handling
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1")
    
    # Clean the text - remove any \r characters and extra whitespace
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Fix: Handle CSV with quoted headers
    lines = text.strip().split('\n')
    if lines and len(lines) > 0:
        first_line = lines[0].strip()
        # Remove any BOM or invisible characters
        first_line = first_line.lstrip('\ufeff')
        # If the header line is quoted as a single string
        if first_line.startswith('"') and first_line.endswith('"') and ',' in first_line:
            fixed_header = first_line.strip('"')
            lines[0] = fixed_header
            text = '\n'.join(lines)
            print(f"✓ Fixed CSV format. New header: {fixed_header}")
    
    # Parse CSV with strict settings
    try:
        reader = csv.DictReader(io.StringIO(text))
        headers = reader.fieldnames
        print(f"CSV Headers: {headers}")
        
        # Debug: print first few rows raw
        rows_list = list(reader)
        print(f"Total rows found: {len(rows_list)}")
        if rows_list:
            print(f"First row raw: {rows_list[0]}")
    except Exception as e:
        raise HTTPException(400, f"Error parsing CSV: {str(e)}")
    
    # Validate columns
    required_cols = {"category", "label", "value"}
    if not required_cols.issubset(set(headers or [])):
        raise HTTPException(
            400,
            f"CSV must have columns: category, label, value. Got: {headers}"
        )
    
    created = updated = skipped = 0
    errors = []
    
    # Process each row
    for i, row in enumerate(rows_list, start=2):
        try:
            # Clean each value - remove BOM, extra spaces, None values
            cat = row.get("category")
            label = row.get("label")
            value_raw = row.get("value")
            
            # Debug print for first few rows
            if i <= 5:
                print(f"Row {i}: cat={repr(cat)}, label={repr(label)}, value={repr(value_raw)}")
            
            # Handle None or empty values
            cat = cat.strip() if cat else ""
            label = label.strip() if label else ""
            value_raw = value_raw.strip() if value_raw else ""
            
            # Convert value to API-friendly format
            if value_raw:
                value = value_raw.lower().replace(" ", "_")
            else:
                value = ""
            
            # Validation
            if not cat:
                errors.append(f"Row {i}: missing category — skipped (value was: {row.get('category')})")
                skipped += 1
                continue
                
            if not label:
                errors.append(f"Row {i}: missing label — skipped (value was: {row.get('label')})")
                skipped += 1
                continue
                
            if not value:
                errors.append(f"Row {i}: missing value — skipped (value was: {row.get('value')})")
                skipped += 1
                continue
            
            if cat not in VALID_CATEGORIES:
                errors.append(f"Row {i}: unknown category '{cat}' — skipped")
                skipped += 1
                continue
            
            # Create or update
            try:
                obj, was_created = DropdownOption.objects.update_or_create(
                    category=cat,
                    value=value,
                    defaults={"label": label, "order": 0, "is_active": True},
                )
                if was_created:
                    created += 1
                else:
                    updated += 1
                print(f"✓ Row {i}: {cat} - {label} ({'created' if was_created else 'updated'})")
            except Exception as e:
                errors.append(f"Row {i}: Database error - {str(e)}")
                skipped += 1
                
        except Exception as e:
            errors.append(f"Row {i}: Unexpected error - {str(e)}")
            skipped += 1
    
    # Prepare response
    response = {
        "created": created,
        "updated": updated,
        "skipped": skipped,
        "errors": errors[:20],  # Limit errors to first 20
    }
    
    print(f"Import completed: {created} created, {updated} updated, {skipped} skipped")
    if errors:
        print(f"First 3 errors: {errors[:3]}")
    
    return response

@router.get("/admin/export/csv")
def export_csv():
    """Download all options as CSV — useful for editing then re-importing."""
    from fastapi.responses import StreamingResponse

    rows = DropdownOption.objects.all().values(
        'category', 'label', 'value', 'order', 'is_active'
    )
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=['category', 'label', 'value', 'order', 'is_active']
    )
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dropdown_options.csv"},
    )