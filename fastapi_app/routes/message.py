#fastapi_app/routes/message.py
from fastapi_app.django_setup import setup_django
setup_django()
from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Request, Query, WebSocket, WebSocketDisconnect, Header
from fastapi.responses import JSONResponse, FileResponse, Response
import mimetypes
from pydantic import BaseModel
from django.db.models import Q
from django.utils import timezone
from fastapi import BackgroundTasks 
from datetime import timedelta, datetime
from creator_app.models import JobPost, UserData, Conversation, Message
from fastapi_app.services.notification_service import create_message_notification
import os
import json
import time
from typing import Dict, Optional, Set
import asyncio
from asgiref.sync import sync_to_async
import shutil
from pathlib import Path
import urllib.parse  # Add this at the top with other imports
from fastapi_app.routes.storage import (
    USE_S3,
    save_upload_file,
    build_full_url,
    delete_file,
    generate_presigned_url,
    ExpiryPreset,
    StoragePath,
    get_storage_path,
)
import hashlib
import json

router = APIRouter(prefix="/message", tags=["Messaging"])

# Store active calls and WebSocket connections
active_calls: Dict[str, dict] = {}
active_connections: Dict[int, WebSocket] = {}
call_signaling_connections: Dict[str, Set[WebSocket]] = {}

# Get the correct media directory path
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_DIR = BASE_DIR / "media"
MESSAGE_FILES_DIR = MEDIA_DIR / "message_files"
CHAT_FILES_DIR = MEDIA_DIR / "chat_files"

MESSAGE_FILES_DIR.mkdir(parents=True, exist_ok=True)
CHAT_FILES_DIR.mkdir(parents=True, exist_ok=True)

#print(f"📁 Base directory: {BASE_DIR}")
#print(f"📁 Media directory: {MEDIA_DIR}")
#print(f"📁 Message files directory: {MESSAGE_FILES_DIR}")
#print(f"📁 Chat files directory: {CHAT_FILES_DIR}")

class StarMessagePayload(BaseModel):
    user_id: int
    is_starred: bool

# Helper: get or create conversation
def get_or_create_conversation(user1, user2):
    if user1.id < user2.id:
        convo = Conversation.objects.filter(user1=user1, user2=user2).first()
        if convo:
            return convo
        return Conversation.objects.create(user1=user1, user2=user2)
    else:
        convo = Conversation.objects.filter(user1=user2, user2=user1).first()
        if convo:
            return convo
        return Conversation.objects.create(user1=user2, user2=user1)

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        self.active_connections[user_id] = websocket
        #print(f"✅ User {user_id} connected via WebSocket")

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            #print(f"🔌 User {user_id} disconnected from WebSocket")

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                return True
            except Exception as e:
                #print(f"Error sending message to user {user_id}: {e}")
                if user_id in self.active_connections:
                    del self.active_connections[user_id]
                return False
        return False
    
    async def broadcast_to_all(self, message: dict):
        disconnected = []
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_json(message)
            except:
                disconnected.append(user_id)
        
        for user_id in disconnected:
            if user_id in self.active_connections:
                del self.active_connections[user_id]

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    #print(f"🔌 WebSocket connection attempt for user {user_id}")
    
    await websocket.accept()
    #print(f"✅ WebSocket connection accepted for user {user_id}")
    
    await manager.connect(websocket, user_id)
    
    try:
        await websocket.send_json({
            "type": "connected", 
            "user_id": user_id,
            "timestamp": time.time()
        })
        #print(f"📤 Sent connection confirmation to user {user_id}")
    except Exception as e:
        print(f"❌ Failed to send connection confirmation: {e}")
    
    try:
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                
                try:
                    message_data = json.loads(data)
                    
                    if message_data.get("type") == "ping":
                        await websocket.send_json({
                            "type": "pong", 
                            "timestamp": time.time()
                        })
                    
                    elif message_data.get("type") == "typing":
                        chat_with = message_data.get("chat_with")
                        if chat_with:
                            await manager.send_personal_message({
                                "type": "typing",
                                "user_id": user_id,
                                "is_typing": message_data.get("is_typing", False)
                            }, chat_with)
                    
                except json.JSONDecodeError:
                    print(f"❌ Invalid JSON from user {user_id}: {data}")
                    
            except asyncio.TimeoutError:
                try:
                    await websocket.send_json({"type": "ping"})
                except:
                    break
            except WebSocketDisconnect:
                #print(f"🔌 User {user_id} disconnected")
                break
                
    except Exception as e:
        print(f"❌ WebSocket error for user {user_id}: {e}")
    finally:
        manager.disconnect(user_id)

# WebRTC Signaling WebSocket
@router.websocket("/call/{call_id}/signal")
async def call_signaling_websocket(websocket: WebSocket, call_id: str):
    #print(f"🔌 Signaling WebSocket connection attempt for call {call_id}")
    
    await websocket.accept()
    #print(f"✅ Signaling WebSocket accepted for call {call_id}")
    
    if call_id not in call_signaling_connections:
        call_signaling_connections[call_id] = set()
    call_signaling_connections[call_id].add(websocket)
    
    user_id = None
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            #print(f"📩 Signaling message for call {call_id}: {message.get('type')}")
            
            if message.get("type") == "join":
                user_id = message.get("user_id")
                #print(f"👤 User {user_id} joined call {call_id}")
                
                for conn in call_signaling_connections[call_id]:
                    if conn != websocket:
                        try:
                            await conn.send_json({
                                "type": "user-joined",
                                "user_id": user_id
                            })
                        except:
                            pass
            
            elif message.get("type") in ["offer", "answer", "ice-candidate"]:
                for conn in call_signaling_connections[call_id]:
                    if conn != websocket:
                        try:
                            await conn.send_json(message)
                        except Exception as e:
                            print(f"❌ Error forwarding signaling message: {e}")    
    except WebSocketDisconnect:
        print(f"🔌 Signaling WebSocket disconnected for call {call_id}")
    except Exception as e:
        print(f"❌ Signaling WebSocket error: {e}")
    finally:
        if call_id in call_signaling_connections:
            call_signaling_connections[call_id].discard(websocket)
            
            if user_id:
                for conn in call_signaling_connections[call_id]:
                    try:
                        await conn.send_json({
                            "type": "user-left",
                            "user_id": user_id
                        })
                    except:
                        pass
            
            if not call_signaling_connections[call_id]:
                del call_signaling_connections[call_id]
                #print(f"🧹 Cleaned up signaling for call {call_id}")

# Pydantic models
class CallInitiate(BaseModel):
    caller_id: int
    receiver_id: int
    call_type: str

class CallJoin(BaseModel):
    user_id: int
    call_id: str

class MessageSessionPayload(BaseModel):
    current_receiver_id: Optional[int] = None
    current_job_id: Optional[int] = None
    active_user_id: Optional[int] = None

# Message Session Cookie APIs
@router.post("/session/set")
async def set_message_session(payload: MessageSessionPayload):
    response = JSONResponse(content={
        "status": "success",
        "message": "Message session stored in cookies"
    })

    if payload.current_receiver_id is not None:
        response.set_cookie(
            key="current_receiver_id",
            value=str(payload.current_receiver_id),
            httponly=False,
            samesite="Lax",
            secure=False,
            max_age=60 * 60 * 24
        )

    if payload.current_job_id is not None:
        response.set_cookie(
            key="current_job_id",
            value=str(payload.current_job_id),
            httponly=False,
            samesite="Lax",
            secure=False,
            max_age=60 * 60 * 24
        )

    if payload.active_user_id is not None:
        response.set_cookie(
            key="active_user_id",
            value=str(payload.active_user_id),
            httponly=False,
            samesite="Lax",
            secure=False,
            max_age=60 * 60 * 24
        )

    return response

@router.get("/session/get")
async def get_message_session(request: Request):
    return {
        "current_receiver_id": request.cookies.get("current_receiver_id"),
        "current_job_id": request.cookies.get("current_job_id"),
        "active_user_id": request.cookies.get("active_user_id")
    }

@router.post("/session/clear")
async def clear_message_session():
    response = JSONResponse(content={
        "status": "success",
        "message": "Message session cleared"
    })

    response.delete_cookie("current_receiver_id")
    response.delete_cookie("current_job_id")
    response.delete_cookie("active_user_id")

    return response

# Call endpoints
@router.post("/call/initiate")
async def initiate_call(call_data: CallInitiate):
    """Initiate a WebRTC call"""
    
    #print(f"📞 Initiating call: caller={call_data.caller_id}, receiver={call_data.receiver_id}, type={call_data.call_type}")

    try:
        sender = await sync_to_async(UserData.objects.get)(id=call_data.caller_id)
        receiver = await sync_to_async(UserData.objects.get)(id=call_data.receiver_id)

        timestamp = int(time.time())
        call_id = f"{call_data.caller_id}_{call_data.receiver_id}_{timestamp}"

        active_calls[call_id] = {
            "caller_id": call_data.caller_id,
            "receiver_id": call_data.receiver_id,
            "status": "initiated",
            "call_type": call_data.call_type,
            "created_at": timezone.now().isoformat(),
            "timeout_task": None
        }

        if call_data.caller_id < call_data.receiver_id:
            convo = await sync_to_async(Conversation.objects.filter(
                user1=sender, user2=receiver
            ).first)()
            if not convo:
                convo = await sync_to_async(Conversation.objects.create)(
                    user1=sender, user2=receiver
                )
        else:
            convo = await sync_to_async(Conversation.objects.filter(
                user1=receiver, user2=sender
            ).first)()
            if not convo:
                convo = await sync_to_async(Conversation.objects.create)(
                    user1=receiver, user2=sender
                )

        call_message = await sync_to_async(Message.objects.create)(
            conversation=convo,
            sender=sender,
            content=f"{call_data.call_type.capitalize()} call",
            message_type="call"
        )

        notification_sent = await manager.send_personal_message({
            "type": "incoming_call",
            "callData": {
                "call_id": call_id,
                "caller_id": call_data.caller_id,
                "caller_name": sender.email,
                "call_type": call_data.call_type,
                "message_id": call_message.id
            }
        }, call_data.receiver_id)
        
        #print(f"📨 WebSocket notification {'sent' if notification_sent else 'failed'} to receiver {call_data.receiver_id}")

        # Auto-end call after 30 seconds if not answered
        async def auto_end_call():
            await asyncio.sleep(30)
            if call_id in active_calls and active_calls[call_id]["status"] == "initiated":
                #print(f"⏰ Call {call_id} timed out after 30 seconds")
                
                await manager.send_personal_message({
                    "type": "call_ended",
                    "call_id": call_id,
                    "reason": "timeout"
                }, call_data.caller_id)
                
                await manager.send_personal_message({
                    "type": "call_ended",
                    "call_id": call_id,
                    "reason": "timeout"
                }, call_data.receiver_id)
                
                if call_id in active_calls:
                    del active_calls[call_id]
                
                if call_id in call_signaling_connections:
                    for ws in call_signaling_connections[call_id]:
                        try:
                            await ws.close()
                        except:
                            pass
                    del call_signaling_connections[call_id]

        timeout_task = asyncio.create_task(auto_end_call())
        active_calls[call_id]["timeout_task"] = timeout_task

        return {
            "status": "success",
            "call_id": call_id,
            "message_id": call_message.id,
            "call_type": call_data.call_type
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        #print(f"❌ Unexpected error in initiate_call: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to initiate call: {str(e)}")

@router.post("/call/{call_id}/join")
async def join_call(call_id: str, join_data: CallJoin):
    """Join an existing WebRTC call"""

    if call_id not in active_calls:
        raise HTTPException(status_code=404, detail="Call not found")

    call_info = active_calls[call_id]

    if join_data.user_id != call_info["caller_id"] and join_data.user_id != call_info["receiver_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to join this call")

    if "timeout_task" in call_info and call_info["timeout_task"]:
        call_info["timeout_task"].cancel()
        call_info["timeout_task"] = None

    call_info["status"] = "joined"

    if join_data.user_id == call_info["receiver_id"]:
        await manager.send_personal_message({
            "type": "call_joined",
            "call_id": call_id
        }, call_info["caller_id"])

    return {
        "status": "success",
        "call_type": call_info["call_type"],
        "call_id": call_id
    }

@router.post("/call/{call_id}/end")
async def end_call(call_id: str, user_id: int = Query(...)):
    """End an active call"""

    if call_id not in active_calls:
        if call_id in call_signaling_connections:
            for ws in call_signaling_connections[call_id]:
                try:
                    await ws.close()
                except:
                    pass
            del call_signaling_connections[call_id]
        raise HTTPException(status_code=404, detail="Call not found")

    call_info = active_calls[call_id]

    if user_id != call_info["caller_id"] and user_id != call_info["receiver_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to end this call")

    if "timeout_task" in call_info and call_info["timeout_task"]:
        call_info["timeout_task"].cancel()
        call_info["timeout_task"] = None

    call_info["status"] = "ended"

    other_user_id = call_info["receiver_id"] if user_id == call_info["caller_id"] else call_info["caller_id"]
    
    # Notify both users that call has ended
    await manager.send_personal_message({
        "type": "call_ended",
        "call_id": call_id,
        "ended_by": user_id
    }, other_user_id)
    
    await manager.send_personal_message({
        "type": "call_ended",
        "call_id": call_id,
        "ended_by": user_id
    }, user_id)

    if call_id in call_signaling_connections:
        for ws in call_signaling_connections[call_id]:
            try:
                await ws.close()
            except:
                pass
        del call_signaling_connections[call_id]

    del active_calls[call_id]

    return {"status": "success", "message": "Call ended"}

@router.get("/call/{call_id}/status")
async def get_call_status(call_id: str):
    if call_id not in active_calls:
        raise HTTPException(status_code=404, detail="Call not found")

    call_info = active_calls[call_id]

    return {
        "status": call_info["status"],
        "call_type": call_info["call_type"],
        "caller_id": call_info["caller_id"],
        "receiver_id": call_info["receiver_id"],
        "created_at": call_info["created_at"]
    }

# User endpoints
@router.get("/users")
async def list_users(request: Request, current_user_id: int = Query(...)):
    try:
        # ✅ Use sync_to_async for database operations
        users = await sync_to_async(list)(UserData.objects.all())
        now = timezone.now()
        result = []

        for u in users:
            if not u.id or u.id == current_user_id:
                continue

            online = False
            if u.last_active:
                online = (now - u.last_active) <= timedelta(seconds=60)

            if current_user_id < u.id:
                convo = await sync_to_async(
                    lambda: Conversation.objects.filter(user1_id=current_user_id, user2=u).first()
                )()
            else:
                convo = await sync_to_async(
                    lambda: Conversation.objects.filter(user1=u, user2_id=current_user_id).first()
                )()

            last_msg = None
            if convo:
                last_msg = await sync_to_async(
                    lambda: convo.messages.order_by("-created_at").first()
                )()

            display_name = u.full_name or u.email or f"User {u.id}"

            unread_count = 0
            if convo:
                unread_count = await sync_to_async(
                    lambda: convo.messages.filter(sender=u, is_seen=False).count()
                )()

            # ✅ FIX: Use build_full_url for profile pictures with S3 support
            profile_url = None
            if hasattr(u, "profile_picture") and u.profile_picture:
                profile_url = build_full_url(
                    request=request,
                    path=str(u.profile_picture),
                    file_type="profile"
                )

            result.append({
                "id": u.id,
                "name": display_name,
                "email": u.email,
                "profile_picture": profile_url,
                "online": online,
                "last_message": last_msg.content if last_msg else "",
                "last_message_time": last_msg.created_at if last_msg else None,
                "last_active": u.last_active,
                "unread_count": unread_count,
            })

        return result

    except Exception as e:
        #print(f"Error in list_users: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


class TypingPayload(BaseModel):
    user_id: int
    chat_with: int
    is_typing: bool

@router.post("/typing")
def set_typing(payload: TypingPayload):
    try:
        user = UserData.objects.filter(id=payload.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.typing_with = payload.chat_with
        user.is_typing = payload.is_typing
        user.last_active = timezone.now()
        user.save(update_fields=["is_typing", "typing_with", "last_active"])

        return {"status": "ok"}
    except Exception as e:
        #print(f"Error in set_typing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send")
async def send_message(
    request: Request,
    background_tasks: BackgroundTasks,  
    sender_id: int = Form(...),
    receiver_id: int = Form(...),
    content: str = Form(None),
    reply_to: int = Form(None),
    file: UploadFile = File(None)
):
    """UPDATED: Send message with S3 support for file attachments"""
    try:
        sender = await sync_to_async(UserData.objects.filter(id=sender_id).first)()
        receiver = await sync_to_async(UserData.objects.filter(id=receiver_id).first)()

        if not sender or not receiver:
            raise HTTPException(status_code=404, detail="User not found")

        sender.last_active = timezone.now()
        sender.is_typing = False
        sender.typing_with = None
        await sync_to_async(sender.save)(update_fields=["last_active", "is_typing", "typing_with"])

        convo = await sync_to_async(get_or_create_conversation)(sender, receiver)

        reply_obj = None
        if reply_to:
            reply_obj = await sync_to_async(Message.objects.filter(id=reply_to).first)()

        file_path = None
        original_filename = None
        final_content = content
        msg_type = "text"
        filename = None  # ✅ Initialize filename variable here

        if file:
            # ✅ Store original filename
            original_filename = file.filename

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_filename = file.filename.replace("..", "").replace("/", "").replace("\\", "")
            filename = f"{timestamp}_{safe_filename}"

            # Save file using the storage module
            if USE_S3:
                file_path = f"message_files/{filename}"
                await save_upload_file(file, file_path)
            else:
                save_path = MESSAGE_FILES_DIR / filename
                with open(save_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                file_path = f"message_files/{filename}"

            ext = filename.split(".")[-1].lower() if '.' in filename else ''
            image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico']

            if ext in image_extensions:
                msg_type = "image"
            else:
                msg_type = "file"

            if not final_content:
                final_content = f"Sent a file: {safe_filename}"

        if final_content is None:
            final_content = ""

        msg = await sync_to_async(Message.objects.create)(
            conversation=convo,
            sender=sender,
            content=final_content,
            reply_to=reply_obj,
            file=file_path,
            message_type=msg_type,
        )

        # ✅ If you have a metadata field on Message model, store original filename
        if hasattr(msg, 'metadata'):
            msg.metadata = {
                'original_filename': original_filename,
                'uploaded_at': datetime.now().isoformat()
            }
            await sync_to_async(msg.save)()

        background_tasks.add_task(
            sync_to_async(create_message_notification),
            msg, receiver, sender
        )

        # Build URL using the helper function
        file_url = build_full_url(
            request=request,
            path=file_path,
            file_type="message"
        )

        # Send WebSocket notification with original filename
        await manager.send_personal_message({
            "type": "new_message",
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "message_id": msg.id,
            "content": final_content,
            "file_url": file_url,
            "file_name": original_filename,  # ✅ Send original filename (None if no file)
            "stored_filename": filename,      # ✅ Send stored filename (None if no file)
            "message_type": msg_type,
            "timestamp": msg.created_at.isoformat(),
            "storage_mode": "s3" if USE_S3 else "local"
        }, receiver_id)

        return {
            "status": "success",
            "conversation_id": convo.id,
            "message_id": msg.id,
            "reply_to": reply_to,
            "file_url": file_url,
            "file_name": original_filename,  # ✅ Return original filename (None if no file)
            "stored_filename": filename,      # ✅ Return stored filename (None if no file)
            "message_type": msg_type,
            "created_at": msg.created_at.isoformat(),
            "storage_mode": "s3" if USE_S3 else "local"
        }

    except Exception as e:
        print(f"❌ Error in send_message: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

# fastapi_app/routes/message.py - Fix delete_message

@router.delete("/{message_id}")
async def delete_message(message_id: int, user_id: int = Query(...)):
    try:
        # ✅ Use sync_to_async for database operations
        msg = await sync_to_async(Message.objects.get)(id=message_id)

        # ✅ Use sync_to_async to access sender
        sender_id = await sync_to_async(lambda: msg.sender.id)()
        
        if sender_id != user_id:
            raise HTTPException(status_code=403, detail="You can only delete your own messages")

        await sync_to_async(msg.delete)()
        return {"status": "success", "message": "Message deleted successfully"}
    except Message.DoesNotExist:
        raise HTTPException(status_code=404, detail="Message not found")
    except Exception as e:
        #print(f"Error in delete_message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# fastapi_app/routes/message.py - Fix delete_conversation

@router.delete("/conversation/{user1_id}/{user2_id}")
async def delete_conversation(user1_id: int, user2_id: int, user_id: int = Query(...)):
    try:
        if user_id not in [user1_id, user2_id]:
            raise HTTPException(status_code=403, detail="Not authorized")

        convo = await sync_to_async(
            lambda: Conversation.objects.filter(
                Q(user1_id=user1_id, user2_id=user2_id) |
                Q(user1_id=user2_id, user2_id=user1_id)
            ).first()
        )()

        if not convo:
            return {"status": "success", "message": "Conversation already deleted"}

        await sync_to_async(convo.messages.all().delete)()
        await sync_to_async(convo.delete)()

        return {"status": "success", "message": "Conversation deleted"}

    except Exception as e:
        #print(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/conversation/{user1_id}/{user2_id}")
async def get_messages(
    request: Request, 
    user1_id: int, 
    user2_id: int,
    if_none_match: Optional[str] = Header(None)
):
    try:
        user1 = await sync_to_async(UserData.objects.filter(id=user1_id).first)()
        user2 = await sync_to_async(UserData.objects.filter(id=user2_id).first)()

        if not user1 or not user2:
            raise HTTPException(status_code=404, detail="User not found")

        now = timezone.now()
        user1.last_active = now
        await sync_to_async(user1.save)(update_fields=["last_active"])

        if user1_id < user2_id:
            convo = await sync_to_async(
                lambda: Conversation.objects.filter(user1_id=user1_id, user2_id=user2_id).first()
            )()
        else:
            convo = await sync_to_async(
                lambda: Conversation.objects.filter(user1_id=user2_id, user2_id=user1_id).first()
            )()

        if not convo:
            return {
                "conversation_id": None,
                "messages": [],
                "other_user_online": False,
                "other_user_typing": (user2.is_typing and user2.typing_with == user1_id) if hasattr(user2, 'is_typing') else False,
                "other_user_last_active": user2.last_active.isoformat() if user2.last_active else None,
            }

        msgs = await sync_to_async(
            lambda: list(convo.messages.select_related('sender', 'reply_to').prefetch_related('starred_by').order_by("created_at"))
        )()

        def get_file_url(file_obj):
            if not file_obj:
                return None
            file_path = str(file_obj.name) if hasattr(file_obj, 'name') else str(file_obj)
            return build_full_url(
                request=request,
                path=file_path,
                file_type="message"
            )

        def get_message_type(file_obj):
            if not file_obj:
                return "text"
            file_path = str(file_obj.name) if hasattr(file_obj, 'name') else str(file_obj)
            ext = file_path.split(".")[-1].lower() if '.' in file_path else ''
            image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico']
            if ext in image_extensions:
                return "image"
            return "file"

        online = False
        if user2.last_active:
            online = (now - user2.last_active) <= timedelta(seconds=60)

        # Get reactions for all messages in one query
        message_ids = [m.id for m in msgs]
        from creator_app.models import MessageReaction
        
        reactions_data = await sync_to_async(
            lambda: list(MessageReaction.objects.filter(
                message_id__in=message_ids
            ).values('message_id', 'emoji', 'user_id'))
        )()
        
        reactions_by_message = {}
        for r in reactions_data:
            msg_id = r['message_id']
            if msg_id not in reactions_by_message:
                reactions_by_message[msg_id] = {}
            if r['emoji'] not in reactions_by_message[msg_id]:
                reactions_by_message[msg_id][r['emoji']] = []
            reactions_by_message[msg_id][r['emoji']].append(r['user_id'])

        formatted_messages = []
        for m in msgs:
            reply_data = None
            if m.reply_to:
                reply_data = {
                    "id": m.reply_to.id,
                    "content": m.reply_to.content,
                    "file_url": get_file_url(m.reply_to.file),
                    "message_type": m.reply_to.message_type or get_message_type(m.reply_to.file),
                }

            message_type = m.message_type
            if m.file and not message_type:
                message_type = get_message_type(m.file)

            call_data = None
            if message_type == "call":
                call_data = {
                    "call_type": "audio" if "audio" in m.content.lower() else "video",
                    "caller_id": m.sender.id,
                    "caller_name": m.sender.email,
                    "status": "completed"
                }

            is_starred = await sync_to_async(
                lambda: m.starred_by.filter(id=user1_id).exists()
            )()

            formatted_messages.append({
                "id": m.id,
                "sender": m.sender.id,
                "content": m.content,
                "file_url": get_file_url(m.file),
                "message_type": message_type,
                "reply_to": reply_data,
                "is_seen": m.is_seen,
                "created_at": m.created_at.isoformat(),
                "call_data": call_data,
                "edited": m.edited,
                "is_starred": is_starred,
                "starred_count": m.starred_by.count(),
                "reactions": reactions_by_message.get(m.id, {}),
            })

        response_data = {
            "conversation_id": convo.id,
            "other_user_online": online,
            "other_user_typing": (user2.is_typing and user2.typing_with == user1_id) if hasattr(user2, 'is_typing') else False,
            "other_user_last_active": user2.last_active.isoformat() if user2.last_active else None,  # <-- FIXED
            "messages": formatted_messages,
            "updated_at": convo.updated_at.isoformat() if hasattr(convo, 'updated_at') else timezone.now().isoformat()
        }
        
        # Generate ETag
        etag_data = json.dumps(response_data, sort_keys=True, default=str)
        etag = hashlib.md5(etag_data.encode()).hexdigest()
        
        # Check if client has the latest version
        if if_none_match and if_none_match == f'"{etag}"':
            return Response(status_code=304)
        
        return JSONResponse(
            content=response_data,
            headers={"ETag": f'"{etag}"'}
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



# fastapi_app/routes/message.py - Fix mark_seen

@router.post("/seen/{conversation_id}/{user_id}")
async def mark_seen(conversation_id: int, user_id: int):
    try:
        convo = await sync_to_async(Conversation.objects.filter(id=conversation_id).first)()
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation not found")

        viewer = await sync_to_async(UserData.objects.filter(id=user_id).first)()
        if viewer:
            viewer.last_active = timezone.now()
            await sync_to_async(viewer.save)(update_fields=["last_active"])

        updated = await sync_to_async(
            lambda: Message.objects.filter(
                conversation=convo
            ).exclude(sender__id=user_id).update(is_seen=True)
        )()
        
        #print(f"👁️ Marked {updated} messages as seen in conversation {conversation_id}")

        return {"status": "seen updated", "count": updated}
    except Exception as e:
        #print(f"Error in mark_seen: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/heartbeat")
async def heartbeat(user_id: int):
    try:
        await sync_to_async(
            UserData.objects.filter(id=user_id).update,
            thread_sensitive=True
        )(last_active=timezone.now())
        
        is_online = user_id in manager.active_connections
        
        return {"status": "ok", "online": is_online}
    except Exception as e:
        #print(f"Error in heartbeat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# fastapi_app/routes/message.py - Complete send_message_for_proposal endpoint

@router.post("/send-for-proposal")
async def send_message_for_proposal(
    request: Request,
    background_tasks: BackgroundTasks,
    job_id: int = Form(...),
    sender_id: int = Form(...),
    content: str = Form(None),
    file: UploadFile = File(None)
):
    """
    Send a message related to a job proposal with S3 support for file attachments.
    S3 Folder Used: chat_files/
    File Type: chat
    """
    try:
        # Get sender
        sender = await sync_to_async(UserData.objects.filter(id=sender_id).first)()
        if not sender:
            raise HTTPException(status_code=404, detail="Sender not found")

        # Get job with employer
        job = await sync_to_async(JobPost.objects.select_related("employer").filter(id=job_id).first)()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        receiver = job.employer

        # Get or create conversation
        if sender.id < receiver.id:
            convo = await sync_to_async(Conversation.objects.filter(user1=sender, user2=receiver).first)()
            if not convo:
                convo = await sync_to_async(Conversation.objects.create)(user1=sender, user2=receiver)
        else:
            convo = await sync_to_async(Conversation.objects.filter(user1=receiver, user2=sender).first)()
            if not convo:
                convo = await sync_to_async(Conversation.objects.create)(user1=receiver, user2=sender)

        file_path = None
        message_type = "text"
        final_content = content or ""

        # Handle file upload with S3 support
        if file:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_filename = file.filename.replace("..", "").replace("/", "").replace("\\", "")
            filename = f"{timestamp}_{safe_filename}"
            
            # ✅ S3-aware file saving
            if USE_S3:
                # S3 path will be chat_files/filename
                file_path = f"chat_files/{filename}"
                await save_upload_file(file, file_path)
            else:
                # Local storage
                save_path = CHAT_FILES_DIR / filename
                with open(save_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                file_path = f"chat_files/{filename}"

            # Detect file type
            ext = filename.split(".")[-1].lower() if '.' in filename else ''
            image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico']
            
            if ext in image_extensions:
                message_type = "image"
            else:
                message_type = "file"

            if not final_content:
                final_content = f"Sent a file: {safe_filename}"

        if final_content is None:
            final_content = ""

        # Create message in database
        msg = await sync_to_async(Message.objects.create)(
            conversation=convo,
            sender=sender,
            content=final_content,
            file=file_path,
            message_type=message_type
        )

        # ✅ Build file URL with S3 support
        if file_path:
            file_url = build_full_url(
                request=request,
                path=file_path,
                file_type="chat"
            )
        else:
            file_url = None

        # Send notification to receiver
        background_tasks.add_task(
            sync_to_async(create_message_notification),
            msg, receiver, sender
        )

        # Send WebSocket notification
        await manager.send_personal_message({
            "type": "new_message",
            "sender_id": sender_id,
            "receiver_id": receiver.id,
            "message_id": msg.id,
            "content": final_content,
            "file_url": file_url,
            "message_type": message_type,
            "timestamp": msg.created_at.isoformat(),
            "storage_mode": "s3" if USE_S3 else "local"
        }, receiver.id)

        return {
            "status": "success",
            "conversation_id": convo.id,
            "message_id": msg.id,
            "receiver_id": receiver.id,
            "file_url": file_url,
            "file_name": file.filename if file else None,
            "message_type": message_type,
            "created_at": msg.created_at.isoformat(),
            "storage_mode": "s3" if USE_S3 else "local"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Error in send_message_for_proposal: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

# ===================================================
# NEW ENDPOINTS - ADDED FOR UNREAD MESSAGE COUNT BADGE
# ===================================================

# ---------------------------------------------------
# GET UNREAD MESSAGE COUNT
# ---------------------------------------------------
@router.get("/unread-count")
async def get_unread_message_count(
    current_user_id: int = Query(..., description="Current user ID")
):
    """
    Get total count of unread messages for the current user across all conversations.
    This endpoint is used by the Header component to display the message badge count.
    """
    try:
        # Get all conversations where the user is a participant
        conversations = await sync_to_async(list)(
            Conversation.objects.filter(
                Q(user1_id=current_user_id) | Q(user2_id=current_user_id)
            )
        )
        
        total_unread = 0
        for convo in conversations:
            # Count unseen messages where current user is NOT the sender
            unread = await sync_to_async(convo.messages.filter(
                is_seen=False
            ).exclude(
                sender_id=current_user_id
            ).count)()
            total_unread += unread
        
        #print(f"📊 Unread message count for user {current_user_id}: {total_unread}")
        
        return {"count": total_unread}
        
    except Exception as e:
        #print(f"❌ Error fetching unread message count: {str(e)}")
        return {"count": 0}


# ---------------------------------------------------
# GET CONVERSATIONS WITH UNREAD COUNTS
# ---------------------------------------------------
@router.get("/conversations")
async def get_conversations_list(
    request: Request,
    current_user_id: int = Query(..., description="Current user ID")
):
    """
    Get all conversations for the current user with unread message counts.
    """
    try:
        user = await sync_to_async(UserData.objects.filter(id=current_user_id).first)()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        conversations = await sync_to_async(list)(
            Conversation.objects.filter(
                Q(user1_id=current_user_id) | Q(user2_id=current_user_id)
            ).prefetch_related('messages')
        )
        
        now = timezone.now()
        result = []
        
        for convo in conversations:
            other_user = convo.user2 if convo.user1_id == current_user_id else convo.user1
            
            last_msg = await sync_to_async(convo.messages.order_by("-created_at").first)()
            
            unread_count = await sync_to_async(convo.messages.filter(
                is_seen=False
            ).exclude(
                sender_id=current_user_id
            ).count)()
            
            online = False
            if other_user.last_active:
                online = (now - other_user.last_active) <= timedelta(seconds=60)
            
            # ✅ FIX: Use build_full_url for profile pictures with S3 support
            profile_url = None
            if hasattr(other_user, "profile_picture") and other_user.profile_picture:
                profile_url = build_full_url(
                    request=request,
                    path=str(other_user.profile_picture),
                    file_type="profile"
                )
            
            result.append({
                "conversation_id": convo.id,
                "other_user": {
                    "id": other_user.id,
                    "name": other_user.full_name or other_user.email or f"User {other_user.id}",
                    "email": other_user.email,
                    "profile_picture": profile_url,
                    "online": online,
                    "last_active": other_user.last_active.isoformat() if other_user.last_active else None
                },
                "last_message": {
                    "content": last_msg.content if last_msg else "",
                    "sender_id": last_msg.sender_id if last_msg else None,
                    "created_at": last_msg.created_at.isoformat() if last_msg else None,
                    "message_type": last_msg.message_type if last_msg else "text"
                } if last_msg else None,
                "unread_count": unread_count,
                "updated_at": convo.updated_at.isoformat() if hasattr(convo, 'updated_at') else None
            })
        
        result.sort(
            key=lambda x: x.get('last_message', {}).get('created_at', '') or '',
            reverse=True
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        #print(f"❌ Error fetching conversations: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------
# MARK ALL MESSAGES AS READ ACROSS ALL CONVERSATIONS
# ---------------------------------------------------
@router.post("/mark-all-read")
async def mark_all_messages_read(
    user_id: int = Query(..., description="User ID to mark all messages as read")
):
    """
    Mark all unseen messages as read for the user across all conversations.
    """
    try:
        # Get all conversations where user is a participant
        conversations = await sync_to_async(list)(
            Conversation.objects.filter(
                Q(user1_id=user_id) | Q(user2_id=user_id)
            )
        )
        
        total_updated = 0
        for convo in conversations:
            # Mark messages as seen where the user is not the sender
            updated = await sync_to_async(convo.messages.filter(
                is_seen=False
            ).exclude(
                sender_id=user_id
            ).update)(is_seen=True)
            total_updated += updated
        
        #print(f"👁️ Marked {total_updated} messages as read for user {user_id}")
        
        return {
            "status": "success",
            "message": f"{total_updated} messages marked as read",
            "count": total_updated
        }
        
    except Exception as e:
        #print(f"❌ Error marking all messages as read: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/download/{file_type}/{filename}")
async def download_file(
    file_type: str, 
    filename: str,
    original_filename: Optional[str] = None
):
    """
    Download a file from message_files or chat_files with S3 support.
    Uses original filename if provided.
    """
    try:
        # ✅ Decode filename if it's URL encoded
        filename = urllib.parse.unquote(filename)
        
        # ✅ Import re for regex
        import re
        pattern = r'^\d{8}_\d{6}_'
        
        # ✅ Determine the clean download filename
        if original_filename:
            # Use provided original filename and clean it
            download_filename = re.sub(pattern, '', original_filename)
        else:
            # Extract from stored filename
            download_filename = re.sub(pattern, '', filename)
        
        # ✅ If no extension, try to preserve it
        if '.' not in download_filename and '.' in filename:
            ext = filename.split('.')[-1]
            download_filename = f"{download_filename}.{ext}"
        
        # ✅ If still has timestamp (shouldn't happen with regex), but just in case
        if download_filename.startswith('20') and '_' in download_filename[:9]:
            parts = download_filename.split('_', 1)
            if len(parts) == 2 and parts[0].isdigit():
                download_filename = parts[1]
        
        print(f"📥 Download: stored={filename}, clean={download_filename}")
        
        # ✅ If using S3, generate a presigned URL with force download
        if USE_S3:
            if file_type == "message_files":
                s3_folder = "message_files"
            elif file_type == "chat_files":
                s3_folder = "chat_files"
            else:
                raise HTTPException(status_code=400, detail="Invalid file type")
            
            s3_key = f"{s3_folder}/{filename}"
            
            # ✅ Generate presigned URL with custom clean filename
            presigned_url = generate_presigned_url(
                s3_key=s3_key,
                expires_in=ExpiryPreset.DAILY,
                force_download=True,
                custom_filename=download_filename  # ✅ Pass the clean filename
            )
            
            if presigned_url:
                # ✅ Return JSON with download URL and clean filename
                return {
                    "success": True,
                    "download_url": presigned_url,
                    "filename": download_filename,
                    "storage_mode": "s3"
                }
            else:
                raise HTTPException(status_code=404, detail="File not found in S3")
        
        # ✅ Local storage mode
        if file_type == "message_files":
            file_path = MESSAGE_FILES_DIR / filename
        elif file_type == "chat_files":
            file_path = CHAT_FILES_DIR / filename
        else:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type:
            mime_type = "application/octet-stream"
        
        return FileResponse(
            path=file_path,
            media_type=mime_type,
            filename=download_filename,
            headers={
                "Content-Disposition": f'attachment; filename="{download_filename}"',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Cache-Control": "public, max-age=86400",
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error downloading file: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
    
# Health check endpoint
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "connections": len(manager.active_connections),
        "active_calls": len(active_calls),
        "signaling_rooms": len(call_signaling_connections),
        "media_dir": str(MEDIA_DIR),
        "message_files_dir": str(MESSAGE_FILES_DIR)
    }

class EditMessageRequest(BaseModel):
    content: str
    user_id: int

def edit_message_sync(message_id: int, content: str, user_id: int):
    """Sync helper function for editing messages"""
    from django.db import transaction
    
    with transaction.atomic():
        msg = Message.objects.select_related('conversation', 'sender').filter(id=message_id).first()
        
        if not msg:
            raise ValueError("Message not found")
        
        if msg.sender.id != user_id:
            raise PermissionError("You can only edit your own messages")
        
        # Update message
        msg.content = content
        msg.edited = True  # Set edited flag to True
        msg.save(update_fields=["content", "edited"])
        
        # Return other user ID for notification
        other_user_id = None
        if msg.conversation.user1_id == user_id:
            other_user_id = msg.conversation.user2_id
        else:
            other_user_id = msg.conversation.user1_id
        
        return other_user_id

@router.put("/{message_id}")
async def edit_message(
    message_id: int,
    edit_data: EditMessageRequest
):
    """Edit an existing message using PUT"""
    try:
        # Run the sync operation in a thread
        other_user_id = await sync_to_async(edit_message_sync)(
            message_id, 
            edit_data.content, 
            edit_data.user_id
        )
        
        # Notify the other user about the edit
        await manager.send_personal_message({
            "type": "message_edited",
            "message_id": message_id,
            "content": edit_data.content,
            "edited": True,  # Send edited flag
            "edited_at": timezone.now().isoformat()
        }, other_user_id)
        
        return {
            "status": "success",
            "message": "Message updated successfully",
            "edited": True,
            "content": edit_data.content
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        #print(f"❌ Error editing message: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Add to your message.py router

class ReactionPayload(BaseModel):
    user_id: int
    emoji: str

@router.post("/message/{message_id}/react")
async def add_reaction(message_id: int, reaction: ReactionPayload):
    """Add or remove a reaction to a message"""
    try:
        from creator_app.models import MessageReaction
        
        # Get message
        msg = await sync_to_async(Message.objects.filter(id=message_id).first)()
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        
        # Get user
        user = await sync_to_async(UserData.objects.filter(id=reaction.user_id).first)()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if reaction exists
        existing_reaction = await sync_to_async(
            MessageReaction.objects.filter(
                message_id=message_id, 
                user_id=reaction.user_id, 
                emoji=reaction.emoji
            ).first
        )()
        
        if existing_reaction:
            # Remove reaction (toggle off)
            await sync_to_async(existing_reaction.delete)()
            action = "removed"
        else:
            # Add reaction
            await sync_to_async(MessageReaction.objects.create)(
                message_id=message_id,
                user_id=reaction.user_id,
                emoji=reaction.emoji
            )
            action = "added"
        
        # Get all reactions for this message
        reactions_data = await sync_to_async(
            lambda: list(MessageReaction.objects.filter(message_id=message_id).values('emoji', 'user_id'))
        )()
        
        # Group reactions by emoji
        grouped_reactions = {}
        for r in reactions_data:
            if r['emoji'] not in grouped_reactions:
                grouped_reactions[r['emoji']] = []
            grouped_reactions[r['emoji']].append(r['user_id'])
        
        # Get conversation and other user
        convo = await sync_to_async(lambda: msg.conversation)()
        other_user_id = convo.user2_id if convo.user1_id == reaction.user_id else convo.user1_id
        
        reaction_update = {
            "type": "reaction_updated",
            "message_id": message_id,
            "reactions": grouped_reactions,
            "user_id": reaction.user_id,
            "emoji": reaction.emoji,
            "action": action
        }
        
        # Send WebSocket message to both users
        await manager.send_personal_message(reaction_update, reaction.user_id)
        await manager.send_personal_message(reaction_update, other_user_id)
        
        # Also dispatch a custom event for non-WebSocket listeners
        # This is important for your React app
        reaction_event = {
            "type": "reaction_updated",
            "detail": reaction_update
        }
        
        return {
            "status": "success",
            "action": action,
            "message_id": message_id,
            "reactions": grouped_reactions
        }
        
    except Exception as e:
        #print(f"❌ Error in reaction: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/message/{message_id}/reactions")
async def get_message_reactions(message_id: int):
    """Get all reactions for a message"""
    try:
        from creator_app.models import MessageReaction
        
        reactions_data = await sync_to_async(
            lambda: list(MessageReaction.objects.filter(message_id=message_id).values('emoji', 'user_id'))
        )()
        
        # Group reactions by emoji
        grouped_reactions = {}
        for r in reactions_data:
            if r['emoji'] not in grouped_reactions:
                grouped_reactions[r['emoji']] = []
            grouped_reactions[r['emoji']].append(r['user_id'])
        
        return {"reactions": grouped_reactions}
        
    except Exception as e:
        #print(f"❌ Error getting reactions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/conversation/by-id/{conversation_id}")
async def get_conversation_by_id(
    conversation_id: int,
    current_user_id: int = Query(..., description="Current user ID")
):
    """
    Get conversation details by ID, including the other user's ID.
    Used when navigating from a notification.
    """
    try:
        convo = await sync_to_async(Conversation.objects.filter(id=conversation_id).first)()
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Determine the other user
        if convo.user1_id == current_user_id:
            other_user_id = convo.user2_id
        elif convo.user2_id == current_user_id:
            other_user_id = convo.user1_id
        else:
            raise HTTPException(status_code=403, detail="You are not a participant in this conversation")
        
        # Get the other user's details
        other_user = await sync_to_async(UserData.objects.filter(id=other_user_id).first)()
        if not other_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "conversation_id": convo.id,
            "other_user_id": other_user_id,
            "other_user": {
                "id": other_user.id,
                "name": other_user.full_name or other_user.email,
                "email": other_user.email,
                "profile_picture": getattr(other_user, 'profile_picture', None),
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        #print(f"❌ Error getting conversation by ID: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
# ===================================================
# STAR/UNSTAR MESSAGE ENDPOINTS
# ===================================================

@router.post("/message/{message_id}/star")
async def star_message(message_id: int, payload: StarMessagePayload):
    """
    Star or unstar a message for a specific user.
    """
    try:
        msg = await sync_to_async(Message.objects.filter(id=message_id).first)()
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        
        user = await sync_to_async(UserData.objects.filter(id=payload.user_id).first)()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user is part of the conversation
        convo = await sync_to_async(lambda: msg.conversation)()
        if convo.user1_id != payload.user_id and convo.user2_id != payload.user_id:
            raise HTTPException(status_code=403, detail="You are not a participant in this conversation")
        
        if payload.is_starred:
            # Star the message
            await sync_to_async(msg.starred_by.add)(user)
            msg.is_starred = True
            msg.starred_at = timezone.now()
            await sync_to_async(msg.save)(update_fields=["is_starred", "starred_at"])
            
            # Notify other user
            other_user_id = convo.user2_id if convo.user1_id == payload.user_id else convo.user1_id
            await manager.send_personal_message({
                "type": "message_starred",
                "message_id": message_id,
                "user_id": payload.user_id,
                "is_starred": True
            }, other_user_id)
            
        else:
            # Unstar the message
            await sync_to_async(msg.starred_by.remove)(user)
            
            # Check if any users have starred this message
            remaining_stars = await sync_to_async(msg.starred_by.count)()
            if remaining_stars == 0:
                msg.is_starred = False
                msg.starred_at = None
                await sync_to_async(msg.save)(update_fields=["is_starred", "starred_at"])
            
            # Notify other user
            other_user_id = convo.user2_id if convo.user1_id == payload.user_id else convo.user1_id
            await manager.send_personal_message({
                "type": "message_starred",
                "message_id": message_id,
                "user_id": payload.user_id,
                "is_starred": False
            }, other_user_id)
        
        return {
            "status": "success",
            "message_id": message_id,
            "is_starred": payload.is_starred,
            "user_id": payload.user_id
        }
        
    except Exception as e:
        print(f"❌ Error starring message: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/message/{message_id}/star-status")
async def get_message_star_status(message_id: int, user_id: int = Query(...)):
    """
    Check if a message is starred by a specific user.
    """
    try:
        msg = await sync_to_async(Message.objects.filter(id=message_id).first)()
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        
        is_starred = await sync_to_async(
            lambda: msg.starred_by.filter(id=user_id).exists()
        )()
        
        return {
            "message_id": message_id,
            "is_starred": is_starred,
            "user_id": user_id
        }
        
    except Exception as e:
        #print(f"❌ Error getting star status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/starred-messages")
async def get_starred_messages(
    request: Request,
    user_id: int = Query(..., description="User ID"),
    limit: int = Query(50, description="Max messages to return")
):
    """
    Get all starred messages for a user.
    """
    try:
        user = await sync_to_async(UserData.objects.filter(id=user_id).first)()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        starred_msgs = await sync_to_async(list)(
            Message.objects.filter(
                starred_by=user
            ).select_related('sender', 'conversation')
            .order_by('-starred_at', '-created_at')[:limit]
        )
        
        result = []
        for msg in starred_msgs:
            # Get the other user in the conversation
            convo = await sync_to_async(lambda: msg.conversation)()
            other_user = convo.user2 if convo.user1_id == user_id else convo.user1
            
            # Build file URL if exists
            file_url = None
            if msg.file:
                file_url = build_full_url(
                    request=request,
                    path=str(msg.file.name) if hasattr(msg.file, 'name') else str(msg.file),
                    file_type="message"
                )
            
            # Determine if message is from current user
            is_from_user = msg.sender_id == user_id
            
            result.append({
                "id": msg.id,
                "content": msg.content,
                "sender_id": msg.sender_id,
                "sender_name": msg.sender.full_name or msg.sender.email,
                "is_from_user": is_from_user,
                "file_url": file_url,
                "message_type": msg.message_type,
                "created_at": msg.created_at.isoformat(),
                "starred_at": msg.starred_at.isoformat() if msg.starred_at else None,
                "conversation": {
                    "id": convo.id,
                    "other_user_id": other_user.id,
                    "other_user_name": other_user.full_name or other_user.email,
                    "other_user_email": other_user.email,
                }
            })
        
        return {
            "status": "success",
            "count": len(result),
            "messages": result
        }
        
    except Exception as e:
        #print(f"❌ Error getting starred messages: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/messages/reactions/batch")
async def get_messages_reactions_batch(
    message_ids: list[int],
    request: Request
):
    """
    Get reactions for multiple messages in one request.
    """
    try:
        from creator_app.models import MessageReaction
        
        if not message_ids:
            return {"reactions": {}}
        
        # Get all reactions for these messages in one query
        reactions_data = await sync_to_async(
            lambda: list(MessageReaction.objects.filter(
                message_id__in=message_ids
            ).values('message_id', 'emoji', 'user_id'))
        )()
        
        # Group by message_id
        grouped_reactions = {}
        for r in reactions_data:
            msg_id = r['message_id']
            if msg_id not in grouped_reactions:
                grouped_reactions[msg_id] = {}
            if r['emoji'] not in grouped_reactions[msg_id]:
                grouped_reactions[msg_id][r['emoji']] = []
            grouped_reactions[msg_id][r['emoji']].append(r['user_id'])
        
        return {"reactions": grouped_reactions}
        
    except Exception as e:
        print(f"❌ Error getting batch reactions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))