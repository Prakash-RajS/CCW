# fastapi_app/routes/dropdown_options.py

import csv
import io
import re
from typing import List, Optional

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field, validator
from django.core.exceptions import ValidationError

# Django ORM is available because django_setup.py is loaded in main.py
from creator_app.models import DropdownOption

router = APIRouter(prefix="/dropdown-options", tags=["Dropdown Options"])


# ── Pydantic schemas with validation ──────────────────────────────────────

class OptionOut(BaseModel):
    id: int
    category: str
    label: str
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class OptionCreate(BaseModel):
    category: str
    label: str = Field(..., min_length=1, max_length=30)
    is_active: Optional[bool] = True

    @validator('label')
    def validate_label(cls, v):
        # Strip whitespace
        v = v.strip()
        if not v:
            raise ValueError('Label cannot be empty')
        if len(v) > 30:
            raise ValueError('Label cannot exceed 30 characters')
        if len(v) < 1:
            raise ValueError('Label must be at least 1 character')
        # Optional: Only allow certain characters
        # if not re.match(r'^[a-zA-Z0-9\s\&\-\.,]+$', v):
        #     raise ValueError('Label contains invalid characters')
        return v

    @validator('category')
    def validate_category(cls, v):
        VALID_CATEGORIES = {
            'creator_category', 'primary_niche', 'secondary_niche',
            'platform', 'followers_range', 'portfolio_category', 'skill_category'
        }
        if v not in VALID_CATEGORIES:
            raise ValueError(f'Invalid category: {v}')
        return v


class OptionUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=30)
    is_active: Optional[bool] = None

    @validator('label')
    def validate_label(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Label cannot be empty')
            if len(v) > 30:
                raise ValueError('Label cannot exceed 30 characters')
            if len(v) < 1:
                raise ValueError('Label must be at least 1 character')
        return v


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
        "is_active": obj.is_active,
        "created_at": obj.created_at.isoformat() if obj.created_at else None,
        "updated_at": obj.updated_at.isoformat() if obj.updated_at else None,
    }


# ── PUBLIC endpoint ────────────────────────────────────────────────────────────

# fastapi_app/routes/dropdown_options.py

@router.get("/all")
def get_all_options():
    """
    Returns all ACTIVE options grouped by category.
    Called once by the React hook; result is cached client-side.
    Response shape: { "creator_category": [{label}, ...], ... }
    """
    qs = DropdownOption.objects.filter(is_active=True).values('category', 'label')
    result: dict = {}
    for item in qs:
        cat = item['category']
        if cat not in result:
            result[cat] = []
        # Make sure we're sending the right structure
        result[cat].append({"label": item['label'], "value": item['label']})
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
    try:
        # Check if option already exists
        existing = DropdownOption.objects.filter(
            category=payload.category,
            label__iexact=payload.label.strip()
        ).first()
        
        if existing:
            return _to_dict(existing)
        
        obj = DropdownOption.objects.create(
            category=payload.category,
            label=payload.label.strip(),
            is_active=payload.is_active if payload.is_active is not None else True,
        )
        return _to_dict(obj)
    except ValidationError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(400, str(e))


@router.put("/admin/{option_id}", response_model=OptionOut)
def admin_update_option(option_id: int, payload: OptionUpdate):
    """Update label / is_active."""
    try:
        obj = DropdownOption.objects.get(id=option_id)
    except DropdownOption.DoesNotExist:
        raise HTTPException(404, "Option not found")

    try:
        if payload.label is not None:
            existing = DropdownOption.objects.filter(
                category=obj.category,
                label__iexact=payload.label.strip()
            ).exclude(id=option_id).first()
            
            if existing:
                obj = existing
                if payload.is_active is not None:
                    obj.is_active = payload.is_active
                obj.save()
                return _to_dict(obj)
            else:
                obj.label = payload.label.strip()
        
        if payload.is_active is not None:
            obj.is_active = payload.is_active
        
        obj.save()
        return _to_dict(obj)
    except ValidationError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(400, str(e))


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


# ── Bulk import via CSV ────────────────────────────────────────────────

@router.post("/admin/bulk-import")
def bulk_import(file: UploadFile = File(...)):
    # Read file content
    content = file.file.read()
    
    # Handle BOM and decode
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1")
    
    # Clean the text
    text = text.replace('\ufeff', '').strip()
    
    # Split into lines
    lines = text.split('\n')
    if not lines:
        raise HTTPException(400, "Empty CSV file")
    
    created = 0
    skipped = 0
    invalid_labels = []
    
    # Parse header
    header_line = lines[0].strip()
    if header_line.startswith('"') and header_line.endswith('"'):
        header_line = header_line[1:-1]
    
    header_parts = [h.strip() for h in header_line.split(',')]
    
    # Find category and label columns
    cat_idx = None
    label_idx = None
    
    for i, col in enumerate(header_parts):
        col_lower = col.lower()
        if col_lower == 'category':
            cat_idx = i
        elif col_lower == 'label':
            label_idx = i
    
    if cat_idx is None or label_idx is None:
        raise HTTPException(
            400,
            f"CSV must have columns: category, label. Found: {header_parts}"
        )
    
    # Process each row
    for i, line in enumerate(lines[1:], start=2):
        if not line.strip():
            continue
            
        try:
            # Parse row
            clean_line = line.strip()
            if clean_line.startswith('"') and clean_line.endswith('"'):
                clean_line = clean_line[1:-1]
            
            parts = clean_line.split(',')
            
            cat = parts[cat_idx].strip() if len(parts) > cat_idx else ""
            label = parts[label_idx].strip() if len(parts) > label_idx else ""
            
            # Validation
            if not cat or not label:
                skipped += 1
                continue
                
            if cat not in VALID_CATEGORIES:
                skipped += 1
                continue
            
            # Validate label length
            if len(label) > 30:
                invalid_labels.append(f"Row {i}: '{label}' exceeds 30 characters")
                skipped += 1
                continue
            
            if len(label) < 1:
                skipped += 1
                continue
            
            # Check if option already exists
            existing = DropdownOption.objects.filter(
                category=cat,
                label__iexact=label
            ).first()
            
            if existing:
                skipped += 1
                continue
            
            # Create new option
            try:
                DropdownOption.objects.create(
                    category=cat,
                    label=label,
                    is_active=True,
                )
                created += 1
            except ValidationError:
                skipped += 1
                
        except Exception:
            skipped += 1
    
    # Return summary
    return {
        "created": created,
        "skipped": skipped,
        "invalid_labels": invalid_labels[:5]  # Show first 5 invalid labels
    }


@router.get("/admin/export/csv")
def export_csv():
    """Download all options as CSV."""
    from fastapi.responses import StreamingResponse

    rows = DropdownOption.objects.all().values('category', 'label', 'is_active')
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=['category', 'label', 'is_active']
    )
    writer.writeheader()
    
    for row in rows:
        row['is_active'] = str(row['is_active'])
    
    writer.writerows(rows)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dropdown_options.csv"},
    )