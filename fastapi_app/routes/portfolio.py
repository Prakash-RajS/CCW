# import fastapi_app.django_setup
# from fastapi import APIRouter, HTTPException, Form, File, UploadFile
# from typing import Optional, List
# from pathlib import Path as PathLib

# from django.core.files.base import ContentFile
# from django.conf import settings

# from creator_app.models import UserData, PortfolioItem


# router = APIRouter(prefix="/portfolio", tags=["Creator Portfolio"])

# FASTAPI_BASE_DIR = PathLib(__file__).resolve().parent.parent


# def get_creator_user(user_id: int):
#     try:
#         user = UserData.objects.get(id=user_id)
#         if str(user.role).lower() != "creator":
#             raise HTTPException(
#                 status_code=403,
#                 detail="Access Denied: Only creators can manage portfolios."
#             )
#         return user
#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")


# # ==========================================
# #  FILE SERVER - For portfolio files
# # ==========================================
# @router.get("/files/{file_path:path}")
# async def serve_portfolio_file(file_path: str):
#     """
#     Serve portfolio files through FastAPI.
#     """
#     try:
#         # Security check
#         if ".." in file_path or file_path.startswith("/"):
#             raise HTTPException(status_code=400, detail="Invalid file path")
        
#         storage_base = FASTAPI_BASE_DIR.parent / "media"
        
#         possible_locations = [
#             storage_base / file_path,
#             FASTAPI_BASE_DIR / "media" / file_path,
#             FASTAPI_BASE_DIR / file_path,
#         ]
        
#         for file_location in possible_locations:
#             if file_location.exists() and file_location.is_file():
#                 from fastapi.responses import FileResponse
#                 import mimetypes
                
#                 mime_type, _ = mimetypes.guess_type(str(file_location))
#                 if not mime_type:
#                     mime_type = "application/octet-stream"
                
#                 return FileResponse(
#                     path=str(file_location),
#                     media_type=mime_type,
#                     filename=file_location.name
#                 )
        
#         raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")


# # ==========================================
# # 1. ADD PORTFOLIO ITEM (Creator Only)
# # ==========================================
# @router.post("/add")
# async def add_portfolio_item(
#     user_id: int = Form(...),
#     title: str = Form(...),
#     media_link: Optional[str] = Form(None),
#     description: Optional[str] = Form(None),
#     file: Optional[UploadFile] = File(None),
# ):
#     user = get_creator_user(user_id)

#     item = PortfolioItem(
#         user=user,
#         role="creator",
#         title=title,
#         media_link=media_link,
#         description=description,
#     )

#     if file and file.filename:
#         content = await file.read()
#         if content:
#             from django.core.files.base import ContentFile
#             import random
#             import string
            
#             def generate_random_digits(length=4):
#                 return ''.join(random.choices(string.digits, k=length))
            
#             random_digits = generate_random_digits()
#             ext = PathLib(file.filename).suffix
#             filename = f"creator_{user_id}_{random_digits}{ext}"
            
#             item.file.save(
#                 filename,
#                 ContentFile(content),
#                 save=True
#             )

#     await item.asave() if hasattr(item, 'asave') else item.save()
    
#     file_url = None
#     if item.file:
#         file_url = f"/portfolio/files/{item.file.name}"
    
#     return {
#         "status": "success",
#         "message": "Portfolio item added successfully",
#         "id": item.id,
#         "file_url": file_url
#     }


# # ==========================================
# # 2. LIST PORTFOLIO (For the 'My Portfolio' Card)
# # ==========================================
# @router.get("/list/{user_id}")
# async def get_portfolio_list(user_id: int):
#     items = await PortfolioItem.objects.filter(
#         user_id=user_id,
#         role="creator"
#     ).order_by("-created_at").alist() if hasattr(PortfolioItem.objects, 'alist') else list(
#         PortfolioItem.objects.filter(
#             user_id=user_id,
#             role="creator"
#         ).order_by("-created_at")
#     )

#     return [
#         {
#             "id": i.id,
#             "title": i.title,
#             "media_link": i.media_link,
#             "description": i.description,
#             "file": (
#                 f"/portfolio/files/{i.file.name}"
#                 if i.file else None
#             ),
#             "created_at": i.created_at.isoformat() if hasattr(i, 'created_at') else None,
#         }
#         for i in items
#     ]


# # ==========================================
# # 3. EDIT PORTFOLIO ITEM
# # ==========================================
# @router.put("/edit/{item_id}")
# async def edit_portfolio_item(
#     item_id: int,
#     title: Optional[str] = Form(None),
#     media_link: Optional[str] = Form(None),
#     description: Optional[str] = Form(None),
#     file: Optional[UploadFile] = File(None),
# ):
#     try:
#         item = await PortfolioItem.objects.aget(id=item_id, role="creator") if hasattr(PortfolioItem.objects, 'aget') else PortfolioItem.objects.get(id=item_id, role="creator")
#     except PortfolioItem.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Portfolio item not found")

#     if title is not None:
#         item.title = title
#     if media_link is not None:
#         item.media_link = media_link
#     if description is not None:
#         item.description = description

#     if file and file.filename:
#         content = await file.read()
#         if content:
#             # Delete old file
#             if item.file:
#                 await item.file.delete(save=False) if hasattr(item.file, 'adelete') else item.file.delete(save=False)
            
#             from django.core.files.base import ContentFile
#             import random
#             import string
#             from pathlib import Path as PathLib
            
#             def generate_random_digits(length=4):
#                 return ''.join(random.choices(string.digits, k=length))
            
#             random_digits = generate_random_digits()
#             ext = PathLib(file.filename).suffix
#             filename = f"creator_updated_{item.user_id}_{random_digits}{ext}"
            
#             item.file.save(
#                 filename,
#                 ContentFile(content),
#                 save=True
#             )

#     await item.asave() if hasattr(item, 'asave') else item.save()
    
#     file_url = None
#     if item.file:
#         file_url = f"/portfolio/files/{item.file.name}"
    
#     return {
#         "status": "success",
#         "message": "Portfolio updated",
#         "file_url": file_url
#     }


# # ==========================================
# # 4. DELETE PORTFOLIO ITEM
# # ==========================================
# @router.delete("/delete/{item_id}")
# async def delete_portfolio_item(item_id: int):
#     try:
#         item = await PortfolioItem.objects.aget(id=item_id, role="creator") if hasattr(PortfolioItem.objects, 'aget') else PortfolioItem.objects.get(id=item_id, role="creator")
#     except PortfolioItem.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Item not found")

#     # delete file from storage
#     if item.file:
#         await item.file.delete(save=False) if hasattr(item.file, 'adelete') else item.file.delete(save=False)

#     await item.adelete() if hasattr(item, 'adelete') else item.delete()
    
#     return {
#         "status": "success",
#         "message": "Item deleted"
#     }


import fastapi_app.django_setup
from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from typing import Optional, List
from pathlib import Path as PathLib

from django.core.files.base import ContentFile
from django.conf import settings

from creator_app.models import UserData, PortfolioItem
import random
import string
from asgiref.sync import sync_to_async

from fastapi_app.routes.plan_guard import check_storage_limit
from creator_app.models import track_file_upload, track_file_deletion

from pathlib import Path
from fastapi_app.routes.dbconnection import ensure_db_connection  # Import database connection helper

# STEP 1 — IMPORT NOTIFICATION
from fastapi_app.services.notification_service import create_notification


router = APIRouter(prefix="/portfolio", tags=["Creator Portfolio"])

FASTAPI_BASE_DIR = PathLib(__file__).resolve().parent.parent


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
#  FILE SERVER - For portfolio files
# ==========================================
@router.get("/files/{file_path:path}")
async def serve_portfolio_file(file_path: str):
    """
    Serve portfolio files through FastAPI.
    """
    try:
        # Security check
        if ".." in file_path or file_path.startswith("/"):
            raise HTTPException(status_code=400, detail="Invalid file path")

        storage_base = FASTAPI_BASE_DIR.parent / "media"

        possible_locations = [
            storage_base / file_path,
            FASTAPI_BASE_DIR / "media" / file_path,
            FASTAPI_BASE_DIR / file_path,
        ]

        # Check file existence synchronously
        from asgiref.sync import sync_to_async
        import os
        
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

        file_size = 0  # track for storage
        if file and file.filename:
            content = await file.read()
            file_size = len(content)

            if content:
                # 🔒 ADD THIS — check storage before saving
                await sync_to_async(check_storage_limit)(user, file_size)

                random_digits = ''.join(random.choices(string.digits, k=4))
                ext = Path(file.filename).suffix
                filename = f"creator_{user_id}_{random_digits}{ext}"

                await sync_to_async(item.file.save)(
                    filename,
                    ContentFile(content),
                    save=False
                )

        await sync_to_async(item.save)()

        # ✅ ADD THIS — track storage usage after successful save
        if file_size > 0:
            await sync_to_async(track_file_upload)(user, str(item.file.name) if item.file else "", file_size)

        # CREATE PORTFOLIO NOTIFICATION
        try:
            await sync_to_async(create_notification)(
                user=user,
                notification_type="portfolio",
                title="Portfolio Added",
                message=f"New portfolio '{title}' added successfully.",
                url="/creator-edit-profile"
            )

            print(f"✅ Portfolio notification created for {user.email}")

        except Exception as e:
            print(f"❌ Portfolio notification error: {e}")

        return {
            "status": "success",
            "message": "Portfolio item added successfully",
            "id": item.id,
        }

    except Exception as e:
        print("ADD PORTFOLIO ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
# ==========================================
# 2. LIST PORTFOLIO (For the 'My Portfolio' Card)
# ==========================================
@router.get("/list/{user_id}")
async def get_portfolio_list(user_id: int):
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
            file_url = await sync_to_async(lambda: f"/portfolio/files/{i.file.name}")()
        
        created_at = None
        if i.created_at:
            created_at = await sync_to_async(lambda: i.created_at.isoformat())()
        
        result.append({
            "id": i.id,
            "title": i.title,
            "media_link": i.media_link,
            "description": i.description,
            "file": file_url,
            "created_at": created_at,
        })
    
    return result


# ==========================================
# 3. EDIT PORTFOLIO ITEM (FULLY FIXED)
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

                if item.file:
                    try:
                        old_file_size = await sync_to_async(
                            lambda: item.file.size
                        )()

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
                # DELETE OLD FILE
                # ==========================================
                if item.file:
                    try:
                        await sync_to_async(
                            item.file.delete
                        )(
                            save=False
                        )

                        # Track deletion
                        if old_file_size > 0:
                            await sync_to_async(
                                track_file_deletion
                            )(
                                item.user,
                                old_file_size
                            )

                    except Exception as delete_error:
                        print(
                            f"Old file delete error: {delete_error}"
                        )

                # ==========================================
                # GENERATE NEW FILE NAME
                # ==========================================
                random_digits = ''.join(
                    random.choices(
                        string.digits,
                        k=4
                    )
                )

                ext = Path(file.filename).suffix

                filename = (
                    f"creator_updated_"
                    f"{item.user_id}_"
                    f"{random_digits}"
                    f"{ext}"
                )

                # ==========================================
                # SAVE NEW FILE
                # ==========================================
                await sync_to_async(
                    item.file.save
                )(
                    filename,
                    ContentFile(content),
                    save=False
                )

        # ==========================================
        # SAVE ITEM
        # ==========================================
        await sync_to_async(item.save)()

        # ==========================================
        # TRACK FILE UPLOAD
        # ==========================================
        if file and file.filename:

            try:
                await sync_to_async(
                    track_file_upload
                )(
                    item.user,
                    str(item.file.name)
                    if item.file else "",
                    new_file_size
                )

                print(
                    "✅ Updated file storage tracked"
                )

            except Exception as storage_error:
                print(
                    f"Storage tracking error: {storage_error}"
                )

        # ==========================================
        # CREATE NOTIFICATION
        # ==========================================
        try:

            def create_notification_sync():

                from creator_app.models import UserData
                from fastapi_app.services.notification_service import (
                    create_notification
                )

                # Fresh DB fetch
                user = UserData.objects.get(
                    id=item.user.id
                )

                return create_notification(
                    user=user,
                    notification_type="portfolio",
                    title="Portfolio Updated",
                    message=(
                        f"Portfolio "
                        f"'{original_title}' "
                        f"updated successfully."
                    ),
                    url="/creator-edit-profile"
                )

            await sync_to_async(
                create_notification_sync,
                thread_sensitive=False
            )()

            print(
                "✅ Portfolio notification created"
            )

        except Exception as notification_error:

            print(
                f"❌ Notification error: "
                f"{notification_error}"
            )

            import traceback
            traceback.print_exc()

        # ==========================================
        # FILE URL
        # ==========================================
        file_url = None

        if item.file:
            file_url = (
                f"/portfolio/files/"
                f"{item.file.name}"
            )

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

        print(
            "EDIT PORTFOLIO ERROR:",
            str(e)
        )

        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to update portfolio item: {str(e)}"
        )
 
    
# ==========================================
# 4. DELETE PORTFOLIO ITEM (COMPLETELY FIXED)
# ==========================================
@router.delete("/delete/{item_id}")
async def delete_portfolio_item(item_id: int):
    try:
        await sync_to_async(ensure_db_connection)()

        # Wrap the entire delete operation in sync_to_async
        def delete_item_sync():
            try:
                item = PortfolioItem.objects.get(id=item_id, role="creator")
                
                # Capture file size and owner before deletion
                file_size = 0
                file_owner = item.user
                item_title = item.title  # Store title for notification
                
                if item.file:
                    try:
                        file_size = item.file.size
                    except Exception:
                        file_size = 0
                    # Delete the file
                    item.file.delete(save=False)
                
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
                    print(f"✅ Portfolio deletion notification created for {file_owner.email}")
                except Exception as e:
                    print(f"❌ Portfolio deletion notification error: {e}")
                
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
        print("DELETE PORTFOLIO ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))