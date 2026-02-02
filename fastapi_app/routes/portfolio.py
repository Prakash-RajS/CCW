import fastapi_app.django_setup
from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from typing import Optional

from django.core.files.base import ContentFile
from django.conf import settings

from creator_app.models import UserData, PortfolioItem


router = APIRouter(prefix="/portfolio", tags=["Creator Portfolio"])


def get_creator_user(user_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        if str(user.role).lower() != "creator":
            raise HTTPException(
                status_code=403,
                detail="Access Denied: Only creators can manage portfolios."
            )
        return user
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")


# ==========================================
# 1. ADD PORTFOLIO ITEM (Creator Only)
# ==========================================
@router.post("/add")
async def add_portfolio_item(
    user_id: int = Form(...),
    title: str = Form(...),
    media_link: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    user = get_creator_user(user_id)

    item = PortfolioItem(
        user=user,
        role="creator",          # 🔥 decides folder
        title=title,
        media_link=media_link,
        description=description,
    )

    if file:
        content = await file.read()
        item.file.save(
            file.filename,
            ContentFile(content),
            save=False
        )

    item.save()
    return {
        "status": "success",
        "message": "Portfolio item added successfully",
        "id": item.id
    }


# ==========================================
# 2. LIST PORTFOLIO (For the 'My Portfolio' Card)
# ==========================================
@router.get("/list/{user_id}")
def get_portfolio_list(user_id: int):
    items = PortfolioItem.objects.filter(
        user_id=user_id,
        role="creator"
    ).order_by("-created_at")

    return [
        {
            "id": i.id,
            "title": i.title,
            "media_link": i.media_link,
            "description": i.description,
            "file": (
                f"http://127.0.0.1:8000/{i.file}"
                if i.file else None
            ),
        }
        for i in items
    ]



# ==========================================
# 3. EDIT PORTFOLIO ITEM
# ==========================================
@router.put("/edit/{item_id}")
async def edit_portfolio_item(
    item_id: int,
    title: Optional[str] = Form(None),
    media_link: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    try:
        item = PortfolioItem.objects.get(id=item_id, role="creator")
    except PortfolioItem.DoesNotExist:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    if title is not None:
        item.title = title
    if media_link is not None:
        item.media_link = media_link
    if description is not None:
        item.description = description

    if file:
        content = await file.read()
        item.file.save(
            file.filename,
            ContentFile(content),
            save=False
        )

    item.save()
    return {
        "status": "success",
        "message": "Portfolio updated"
    }


# ==========================================
# 4. DELETE PORTFOLIO ITEM
# ==========================================
@router.delete("/delete/{item_id}")
def delete_portfolio_item(item_id: int):
    try:
        item = PortfolioItem.objects.get(id=item_id, role="creator")
    except PortfolioItem.DoesNotExist:
        raise HTTPException(status_code=404, detail="Item not found")

    # delete file from storage
    if item.file:
        item.file.delete(save=False)

    item.delete()
    return {
        "status": "success",
        "message": "Item deleted"
    }
