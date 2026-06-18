import fastapi_app.django_setup
from fastapi import APIRouter, HTTPException, Form, File, UploadFile, Request
from typing import Optional, List
from pathlib import Path as PathLib
import os

from django.core.files.base import ContentFile
from django.conf import settings

from creator_app.models import UserData, PortfolioItem
import random
import string
from asgiref.sync import sync_to_async

from fastapi_app.routes.plan_guard import check_storage_limit
from creator_app.models import track_file_upload, track_file_deletion

from pathlib import Path
from fastapi_app.routes.dbconnection import ensure_db_connection

# ==========================================
# IMPORT S3 STORAGE FUNCTIONS
# ==========================================
from fastapi_app.routes.storage import (
    save_portfolio_upload_creator,
    get_portfolio_upload_url,
    delete_file,
    USE_S3
)

# IMPORT NOTIFICATION
from fastapi_app.services.notification_service import create_notification


router = APIRouter(prefix="/portfolio", tags=["Creator Portfolio"])

FASTAPI_BASE_DIR = PathLib(__file__).resolve().parent.parent


# ==========================================
# HELPER: BUILD FULL URL WITH S3 SUPPORT
# ==========================================
# In portfolio.py, update the build_portfolio_url function

def build_portfolio_url(request: Request, path: str | None) -> str | None:
    """Build full URL for portfolio files with S3 support"""
    if not path:
        return None
    if path.startswith('http'):
        return path
    
    # Check if using S3
    use_s3_env = os.getenv("USE_S3", "False").lower() == "true"
    
    if use_s3_env:
        s3_key = path.lstrip('/')
        
        # Check if this is already an S3 path
        if s3_key.startswith('portfolio_uploads/'):
            # Try to generate S3 presigned URL
            file_url = get_portfolio_upload_url(s3_key)
            if file_url:
                return file_url
        
        # If not in S3 or S3 URL generation failed, check if file exists locally
        # This handles files that were uploaded before S3 was enabled
        base_url = str(request.base_url).rstrip('/')
        clean_path = path.lstrip('/')
        local_path = Path(f"media/{clean_path}")
        
        if local_path.exists():
            # File exists locally, serve from local
            return f"{base_url}/media/{clean_path}"
        
        # If not found locally either, try S3 one more time with the path as-is
        file_url = get_portfolio_upload_url(s3_key)
        if file_url:
            return file_url
        
        # Last resort: try to construct a URL
        return f"{base_url}/media/{clean_path}"
    
    # Fallback to local media path
    base_url = str(request.base_url).rstrip('/')
    clean_path = path.lstrip('/')
    return f"{base_url}/media/{clean_path}"


async def get_creator_user(user_id: int):
    try:
        # Ensure database connection is alive
        await sync_to_async(ensure_db_connection)()
        
        user = await sync_to_async(UserData.objects.get)(id=user_id)
        if str(user.role).lower() != "creator":
            raise HTTPException(
                status_code=403,
                detail="Access Denied: Only creators can manage portfolios."
            )
        return user
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")


# ==========================================
#  FILE SERVER - For portfolio files (UPDATED FOR S3)
# ==========================================
@router.get("/files/{file_path:path}")
async def serve_portfolio_file(file_path: str, request: Request):
    """
    Serve portfolio files through FastAPI with S3 support.
    """
    try:
        # Security check
        if ".." in file_path or file_path.startswith("/"):
            raise HTTPException(status_code=400, detail="Invalid file path")

        # Check if using S3
        use_s3_env = os.getenv("USE_S3", "False").lower() == "true"
        
        if use_s3_env:
            # For S3: Generate presigned URL and redirect
            s3_key = file_path.lstrip('/')
            presigned_url = get_portfolio_upload_url(s3_key)
            
            if presigned_url:
                from fastapi.responses import RedirectResponse
                return RedirectResponse(url=presigned_url, status_code=302)
            else:
                raise HTTPException(status_code=404, detail="File not found in S3")
        else:
            # For local storage: Serve file directly
            storage_base = FASTAPI_BASE_DIR.parent / "media"

            possible_locations = [
                storage_base / file_path,
                FASTAPI_BASE_DIR / "media" / file_path,
                FASTAPI_BASE_DIR / file_path,
            ]

            # Check file existence synchronously
            def check_file_exists(locations):
                for file_location in locations:
                    if file_location.exists() and file_location.is_file():
                        return str(file_location)
                return None
                
            file_path_str = await sync_to_async(check_file_exists)(possible_locations)
            
            if file_path_str:
                from fastapi.responses import FileResponse
                import mimetypes

                mime_type, _ = mimetypes.guess_type(file_path_str)
                if not mime_type:
                    mime_type = "application/octet-stream"

                return FileResponse(
                    path=file_path_str,
                    media_type=mime_type,
                    filename=PathLib(file_path_str).name
                )
            else:
                raise HTTPException(status_code=404, detail=f"File not found: {file_path}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")


# ==========================================
# 1. ADD PORTFOLIO ITEM (UPDATED FOR S3)
# ==========================================
@router.post("/add")
async def add_portfolio_item(
    request: Request,
    user_id: int = Form(...),
    title: str = Form(...),
    media_link: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    try:
        await sync_to_async(ensure_db_connection)()
        user = await sync_to_async(UserData.objects.get)(id=user_id)

        if str(user.role).lower() != "creator":
            raise HTTPException(status_code=403, detail="Only creators allowed")

        item = PortfolioItem(
            user=user,
            role="creator",
            title=title,
            media_link=media_link,
            description=description,
        )

        # Save the item first to get an ID
        await sync_to_async(item.save)()

        file_size = 0
        use_s3_env = os.getenv("USE_S3", "False").lower() == "true"

        if file and file.filename:
            content = await file.read()
            file_size = len(content)

            if content:
                # Check storage limit
                await sync_to_async(check_storage_limit)(user, file_size)

                if use_s3_env:
                    # ========== S3 STORAGE ==========
                    try:
                        s3_key = await save_portfolio_upload_creator(
                            file, 
                            str(user_id), 
                            str(item.id)
                        )
                        # Store the S3 key in the file field
                        item.file.name = s3_key
                        await sync_to_async(item.save)()
                        # print(f"✅ Portfolio saved to S3: {s3_key}")
                    except Exception as e:
                        # print(f"⚠️ S3 upload failed, using local storage: {e}")
                        # Fallback to local storage
                        random_digits = ''.join(random.choices(string.digits, k=4))
                        ext = Path(file.filename).suffix
                        filename = f"creator_{user_id}_{random_digits}{ext}"
                        await sync_to_async(item.file.save)(
                            filename,
                            ContentFile(content),
                            save=False
                        )
                        await sync_to_async(item.save)()
                else:
                    # ========== LOCAL STORAGE ==========
                    random_digits = ''.join(random.choices(string.digits, k=4))
                    ext = Path(file.filename).suffix
                    filename = f"creator_{user_id}_{random_digits}{ext}"
                    await sync_to_async(item.file.save)(
                        filename,
                        ContentFile(content),
                        save=False
                    )
                    await sync_to_async(item.save)()

                # Track file upload
                await sync_to_async(track_file_upload)(
                    user, 
                    str(item.file.name) if item.file else "", 
                    file_size
                )

        # CREATE PORTFOLIO NOTIFICATION
        try:
            await sync_to_async(create_notification)(
                user=user,
                notification_type="portfolio",
                title="Portfolio Added",
                message=f"New portfolio '{title}' added successfully.",
                url="/creator-edit-profile"
            )
            # print(f"✅ Portfolio notification created for {user.email}")
        except Exception as e:
            pass
            # print(f"❌ Portfolio notification error: {e}")

        # Generate file URL
        file_url = None
        if item.file:
            file_url = build_portfolio_url(request, item.file.name)

        return {
            "status": "success",
            "message": "Portfolio item added successfully",
            "id": item.id,
            "file_url": file_url,
        }

    except Exception as e:
        # print("ADD PORTFOLIO ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 2. LIST PORTFOLIO (UPDATED FOR S3)
# ==========================================
@router.get("/list/{user_id}")
async def get_portfolio_list(user_id: int, request: Request):
    # Ensure database connection is alive
    await sync_to_async(ensure_db_connection)()
    
    # Define sync function to get items
    def get_items():
        return list(
            PortfolioItem.objects.filter(
                user_id=user_id,
                role="creator"
            ).order_by("-created_at")
        )
    
    items = await sync_to_async(get_items)()

    result = []
    for i in items:
        file_url = None
        if i.file:
            # Use build_portfolio_url for S3 support
            file_url = build_portfolio_url(request, i.file.name)
        
        created_at = None
        if i.created_at:
            created_at = await sync_to_async(lambda: i.created_at.isoformat())()
        
        result.append({
            "id": i.id,
            "title": i.title,
            "media_link": i.media_link,
            "description": i.description,
            "file_url": file_url,
            "created_at": created_at,
        })
    
    return result


# ==========================================
# 3. EDIT PORTFOLIO ITEM (UPDATED FOR S3)
# ==========================================
@router.put("/edit/{item_id}")
async def edit_portfolio_item(
    request: Request,
    item_id: int,
    title: Optional[str] = Form(None),
    media_link: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    try:
        # ==========================================
        # ENSURE DB CONNECTION
        # ==========================================
        await sync_to_async(ensure_db_connection)()

        # ==========================================
        # GET PORTFOLIO ITEM
        # ==========================================
        try:
            item = await sync_to_async(
                PortfolioItem.objects.select_related("user").get
            )(
                id=item_id,
                role="creator"
            )

        except PortfolioItem.DoesNotExist:
            raise HTTPException(
                status_code=404,
                detail="Portfolio item not found"
            )

        # ==========================================
        # STORE ORIGINAL TITLE
        # ==========================================
        original_title = item.title
        use_s3_env = os.getenv("USE_S3", "False").lower() == "true"

        # ==========================================
        # UPDATE FIELDS
        # ==========================================
        if title is not None:
            item.title = title.strip()

        if media_link is not None:
            item.media_link = media_link.strip()

        if description is not None:
            item.description = description.strip()

        # ==========================================
        # HANDLE FILE UPDATE
        # ==========================================
        if file and file.filename:

            # Read file content
            content = await file.read()

            if content:

                new_file_size = len(content)

                # ==========================================
                # GET OLD FILE SIZE
                # ==========================================
                old_file_size = 0
                old_file_name = None

                if item.file:
                    try:
                        old_file_size = await sync_to_async(
                            lambda: item.file.size
                        )()
                        old_file_name = item.file.name
                    except Exception:
                        old_file_size = 0

                # ==========================================
                # CHECK STORAGE LIMIT
                # ==========================================
                net_increase = max(
                    0,
                    new_file_size - old_file_size
                )

                if net_increase > 0:
                    await sync_to_async(
                        check_storage_limit
                    )(
                        item.user,
                        net_increase
                    )

                # ==========================================
                # DELETE OLD FILE (S3 or Local)
                # ==========================================
                if old_file_name:
                    try:
                        if use_s3_env:
                            # Delete from S3
                            s3_key = old_file_name.lstrip('/')
                            delete_file(s3_key)
                            # print(f"✅ Deleted old portfolio from S3: {s3_key}")
                        else:
                            # Delete from local
                            await sync_to_async(
                                item.file.delete
                            )(save=False)
                            # print(f"✅ Deleted old portfolio locally: {old_file_name}")

                        # Track deletion
                        if old_file_size > 0:
                            await sync_to_async(
                                track_file_deletion
                            )(
                                item.user,
                                old_file_size
                            )

                    except Exception as delete_error:
                        pass
                        # print(f"Old file delete error: {delete_error}")

                # ==========================================
                # SAVE NEW FILE (S3 or Local)
                # ==========================================
                if use_s3_env:
                    # ========== S3 STORAGE ==========
                    try:
                        s3_key = await save_portfolio_upload_creator(
                            file,
                            str(item.user_id),
                            str(item.id)
                        )
                        item.file.name = s3_key
                        # print(f"✅ Portfolio updated in S3: {s3_key}")
                    except Exception as e:
                        # print(f"⚠️ S3 upload failed, using local storage: {e}")
                        # Fallback to local storage
                        random_digits = ''.join(random.choices(string.digits, k=4))
                        ext = Path(file.filename).suffix
                        filename = f"creator_updated_{item.user_id}_{random_digits}{ext}"
                        await sync_to_async(item.file.save)(
                            filename,
                            ContentFile(content),
                            save=False
                        )
                else:
                    # ========== LOCAL STORAGE ==========
                    random_digits = ''.join(random.choices(string.digits, k=4))
                    ext = Path(file.filename).suffix
                    filename = f"creator_updated_{item.user_id}_{random_digits}{ext}"
                    await sync_to_async(item.file.save)(
                        filename,
                        ContentFile(content),
                        save=False
                    )
                    # print(f"✅ Portfolio updated locally: {filename}")

                # ==========================================
                # TRACK FILE UPLOAD
                # ==========================================
                try:
                    await sync_to_async(
                        track_file_upload
                    )(
                        item.user,
                        str(item.file.name) if item.file else "",
                        new_file_size
                    )
                    # print("✅ Updated file storage tracked")
                except Exception as storage_error:
                    pass
                    # print(f"Storage tracking error: {storage_error}")

        # ==========================================
        # SAVE ITEM
        # ==========================================
        await sync_to_async(item.save)()

        # ==========================================
        # CREATE NOTIFICATION
        # ==========================================
        try:
            def create_notification_sync():
                user = UserData.objects.get(id=item.user.id)
                return create_notification(
                    user=user,
                    notification_type="portfolio",
                    title="Portfolio Updated",
                    message=f"Portfolio '{original_title}' updated successfully.",
                    url="/creator-edit-profile"
                )

            await sync_to_async(
                create_notification_sync,
                thread_sensitive=False
            )()
            # print("✅ Portfolio notification created")
        except Exception as notification_error:
            pass
            # print(f"❌ Notification error: {notification_error}")
            import traceback
            traceback.print_exc()

        # ==========================================
        # FILE URL
        # ==========================================
        file_url = None
        if item.file:
            file_url = build_portfolio_url(request, item.file.name)

        # ==========================================
        # RESPONSE
        # ==========================================
        return {
            "status": "success",
            "message": "Portfolio updated successfully",
            "portfolio": {
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "media_link": item.media_link,
                "file_url": file_url,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        pass
        # print("EDIT PORTFOLIO ERROR:", str(e))
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update portfolio item: {str(e)}"
        )


# ==========================================
# 4. DELETE PORTFOLIO ITEM (UPDATED FOR S3)
# ==========================================
@router.delete("/delete/{item_id}")
async def delete_portfolio_item(item_id: int):
    try:
        await sync_to_async(ensure_db_connection)()

        def delete_item_sync():
            try:
                item = PortfolioItem.objects.get(id=item_id, role="creator")
                
                # Capture file info before deletion
                file_size = 0
                file_owner = item.user
                item_title = item.title
                file_name = None
                
                # Check if using S3
                use_s3_env = os.getenv("USE_S3", "False").lower() == "true"
                
                if item.file:
                    try:
                        file_size = item.file.size
                        file_name = item.file.name
                    except Exception:
                        file_size = 0
                    
                    # Delete the file (S3 or Local)
                    if use_s3_env and file_name:
                        # Delete from S3
                        s3_key = file_name.lstrip('/')
                        delete_file(s3_key)
                        # print(f"✅ Deleted portfolio from S3: {s3_key}")
                    else:
                        # Delete from local
                        item.file.delete(save=False)
                        # print(f"✅ Deleted portfolio locally: {file_name}")
                
                # Delete the portfolio item
                item.delete()
                
                # Release storage after successful delete
                if file_size > 0:
                    track_file_deletion(file_owner, file_size)
                
                # CREATE PORTFOLIO DELETED NOTIFICATION
                try:
                    create_notification(
                        user=file_owner,
                        notification_type="portfolio",
                        title="Portfolio Deleted",
                        message=f"Portfolio '{item_title}' has been deleted.",
                        url="/creator-edit-profile"
                    )
                    # print(f"✅ Portfolio deletion notification created for {file_owner.email}")
                except Exception as e:
                    pass
                    # print(f"❌ Portfolio deletion notification error: {e}")
                
                return {"status": "success", "message": "Item deleted"}
                
            except PortfolioItem.DoesNotExist:
                raise HTTPException(status_code=404, detail="Item not found")
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
        
        # Run the entire sync operation
        result = await sync_to_async(delete_item_sync)()
        return result

    except HTTPException:
        raise
    except Exception as e:
        # print("DELETE PORTFOLIO ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 5. GET SINGLE PORTFOLIO ITEM (NEW - UPDATED FOR S3)
# ==========================================
@router.get("/item/{item_id}")
async def get_portfolio_item(item_id: int, request: Request):
    """Get a single portfolio item by ID with S3 support"""
    try:
        await sync_to_async(ensure_db_connection)()
        
        def get_item():
            return PortfolioItem.objects.get(id=item_id, role="creator")
        
        item = await sync_to_async(get_item)()
        
        file_url = None
        if item.file:
            file_url = build_portfolio_url(request, item.file.name)
        
        return {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "media_link": item.media_link,
            "file_url": file_url,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "user_id": item.user_id,
        }
        
    except PortfolioItem.DoesNotExist:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    except Exception as e:
        # print("GET PORTFOLIO ITEM ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))