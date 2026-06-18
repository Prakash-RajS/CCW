
from fastapi_app.django_setup import setup_django
setup_django()

from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Request, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, FileResponse, Response
import mimetypes
from pydantic import BaseModel
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta, datetime
from creator_app.models import JobPost, UserData, Conversation, Message
import os
import json
import time
from typing import Dict, Optional, Set
import asyncio
from asgiref.sync import sync_to_async
import shutil
from pathlib import Path
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

print(f"📁 Base directory: {BASE_DIR}")
print(f"📁 Media directory: {MEDIA_DIR}")
print(f"📁 Message files directory: {MESSAGE_FILES_DIR}")
print(f"📁 Chat files directory: {CHAT_FILES_DIR}")

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
        print(f"✅ User {user_id} connected via WebSocket")

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"🔌 User {user_id} disconnected from WebSocket")

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                return True
            except Exception as e:
                print(f"Error sending message to user {user_id}: {e}")
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
    print(f"🔌 WebSocket connection attempt for user {user_id}")
    
    await websocket.accept()
    print(f"✅ WebSocket connection accepted for user {user_id}")
    
    await manager.connect(websocket, user_id)
    
    try:
        await websocket.send_json({
            "type": "connected", 
            "user_id": user_id,
            "timestamp": time.time()
        })
        print(f"📤 Sent connection confirmation to user {user_id}")
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
                print(f"🔌 User {user_id} disconnected")
                break
                
    except Exception as e:
        print(f"❌ WebSocket error for user {user_id}: {e}")
    finally:
        manager.disconnect(user_id)

# WebRTC Signaling WebSocket
@router.websocket("/call/{call_id}/signal")
async def call_signaling_websocket(websocket: WebSocket, call_id: str):
    print(f"🔌 Signaling WebSocket connection attempt for call {call_id}")
    
    await websocket.accept()
    print(f"✅ Signaling WebSocket accepted for call {call_id}")
    
    if call_id not in call_signaling_connections:
        call_signaling_connections[call_id] = set()
    call_signaling_connections[call_id].add(websocket)
    
    user_id = None
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"📩 Signaling message for call {call_id}: {message.get('type')}")
            
            if message.get("type") == "join":
                user_id = message.get("user_id")
                print(f"👤 User {user_id} joined call {call_id}")
                
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
                print(f"🧹 Cleaned up signaling for call {call_id}")

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
    
    print(f"📞 Initiating call: caller={call_data.caller_id}, receiver={call_data.receiver_id}, type={call_data.call_type}")

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
        
        print(f"📨 WebSocket notification {'sent' if notification_sent else 'failed'} to receiver {call_data.receiver_id}")

        # Auto-end call after 30 seconds if not answered
        async def auto_end_call():
            await asyncio.sleep(30)
            if call_id in active_calls and active_calls[call_id]["status"] == "initiated":
                print(f"⏰ Call {call_id} timed out after 30 seconds")
                
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
        print(f"❌ Unexpected error in initiate_call: {e}")
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
def list_users(request: Request, current_user_id: int = Query(...)):
    try:
        users = UserData.objects.all()
        now = timezone.now()
        result = []

        for u in users:
            if not u.id or u.id == current_user_id:
                continue

            online = False
            if u.last_active:
                online = (now - u.last_active) <= timedelta(seconds=60)

            if current_user_id < u.id:
                convo = Conversation.objects.filter(user1_id=current_user_id, user2=u).first()
            else:
                convo = Conversation.objects.filter(user1=u, user2_id=current_user_id).first()

            last_msg = None
            if convo:
                last_msg = convo.messages.order_by("-created_at").first()

            display_name = u.full_name or u.email or f"User {u.id}"

            unread_count = 0
            if convo:
                unread_count = convo.messages.filter(
                    sender=u,
                    is_seen=False
                ).count()

            profile_url = None
            if hasattr(u, "profile_picture") and u.profile_picture:
                profile_url = f"{request.base_url}media/{u.profile_picture}".replace("\\", "/")

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
        print(f"Error in list_users: {e}")
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
        print(f"Error in set_typing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send")
@router.post("/send")
async def send_message(
    request: Request,
    sender_id: int = Form(...),
    receiver_id: int = Form(...),
    content: str = Form(None),
    reply_to: int = Form(None),
    file: UploadFile = File(None)
):
    """UPDATED: Send message with S3 support for file attachments"""
    try:
        print(f"📤 Send message request: sender={sender_id}, receiver={receiver_id}")
        
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
        final_content = content
        msg_type = "text"

        if file:
            # Use S3-aware file saving
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_filename = file.filename.replace("..", "").replace("/", "").replace("\\", "")
            filename = f"{timestamp}_{safe_filename}"
            
            # Save file using the storage module
            # For message files, we save to message_files folder
            if USE_S3:
                # S3 path will be message_files/filename
                file_path = f"message_files/{filename}"
                await save_upload_file(file, file_path)
            else:
                # Local storage
                save_path = MESSAGE_FILES_DIR / filename
                with open(save_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                file_path = f"message_files/{filename}"
            
            # Detect file type
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
            message_type=msg_type
        )

        # Build URL using the helper function
        file_url = build_full_url(
            request=request,
            path=file_path,
            file_type="message"
        )

        # Send WebSocket notification
        await manager.send_personal_message({
            "type": "new_message",
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "message_id": msg.id,
            "content": final_content,
            "file_url": file_url,
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
            "file_name": file.filename if file else None,
            "message_type": msg_type,
            "created_at": msg.created_at.isoformat(),
            "storage_mode": "s3" if USE_S3 else "local"
        }

    except Exception as e:
        print(f"❌ Error in send_message: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")


@router.delete("/{message_id}")
def delete_message(message_id: int, user_id: int = Query(...)):
    try:
        msg = Message.objects.get(id=message_id)

        if msg.sender.id != user_id:
            raise HTTPException(status_code=403, detail="You can only delete your own messages")

        msg.delete()
        return {"status": "success", "message": "Message deleted successfully"}
    except Message.DoesNotExist:
        raise HTTPException(status_code=404, detail="Message not found")
    except Exception as e:
        print(f"Error in delete_message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/conversation/{user1_id}/{user2_id}")
def delete_conversation(user1_id: int, user2_id: int, user_id: int = Query(...)):
    try:
        if user_id not in [user1_id, user2_id]:
            raise HTTPException(status_code=403, detail="Not authorized")

        convo = Conversation.objects.filter(
            Q(user1_id=user1_id, user2_id=user2_id) |
            Q(user1_id=user2_id, user2_id=user1_id)
        ).first()

        if not convo:
            return {"status": "success", "message": "Conversation already deleted"}

        convo.messages.all().delete()
        convo.delete()

        return {"status": "success", "message": "Conversation deleted"}

    except Exception as e:
        print(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversation/{user1_id}/{user2_id}")
def get_messages(request: Request, user1_id: int, user2_id: int):
    try:
        user1 = UserData.objects.filter(id=user1_id).first()
        user2 = UserData.objects.filter(id=user2_id).first()

        if not user1 or not user2:
            raise HTTPException(status_code=404, detail="User not found")

        now = timezone.now()
        user1.last_active = now
        user1.save(update_fields=["last_active"])

        if user1_id < user2_id:
            convo = Conversation.objects.filter(user1_id=user1_id, user2_id=user2_id).first()
        else:
            convo = Conversation.objects.filter(user1_id=user2_id, user2_id=user1_id).first()

        if not convo:
            return {
                "conversation_id": None,
                "messages": [],
                "other_user_online": False,
                "other_user_typing": (user2.is_typing and user2.typing_with == user1_id) if hasattr(user2, 'is_typing') else False,
                "other_user_last_active": user2.last_active,
            }

        msgs = convo.messages.all().order_by("created_at")

        def get_file_url(file_obj):
            if not file_obj:
                return None
            url = f"{request.base_url}media/{file_obj.name}".replace("\\", "/")
            return url

        def get_message_type(file_obj):
            if not file_obj:
                return "text"
            ext = file_obj.name.split(".")[-1].lower() if '.' in file_obj.name else ''
            image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico']
            if ext in image_extensions:
                return "image"
            return "file"

        online = False
        if user2.last_active:
            online = (now - user2.last_active) <= timedelta(seconds=60)

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
                "edited": m.edited  # Add this line - return edited status
            })

        return {
            "conversation_id": convo.id,
            "other_user_online": online,
            "other_user_typing": (user2.is_typing and user2.typing_with == user1_id) if hasattr(user2, 'is_typing') else False,
            "other_user_last_active": user2.last_active,
            "messages": formatted_messages
        }
    except Exception as e:
        print(f"Error in get_messages: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/seen/{conversation_id}/{user_id}")
def mark_seen(conversation_id: int, user_id: int):
    try:
        convo = Conversation.objects.filter(id=conversation_id).first()
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation not found")

        viewer = UserData.objects.filter(id=user_id).first()
        if viewer:
            viewer.last_active = timezone.now()
            viewer.save(update_fields=["last_active"])

        updated = Message.objects.filter(
            conversation=convo
        ).exclude(sender__id=user_id).update(is_seen=True)
        
        print(f"👁️ Marked {updated} messages as seen in conversation {conversation_id}")

        return {"status": "seen updated", "count": updated}
    except Exception as e:
        print(f"Error in mark_seen: {e}")
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
        print(f"Error in heartbeat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send-for-proposal")
async def send_message_for_proposal(
    job_id: int = Form(...),
    sender_id: int = Form(...),
    content: str = Form(None),
    file: UploadFile = File(None)
):
    try:
        sender = await sync_to_async(UserData.objects.filter(id=sender_id).first)()
        if not sender:
            raise HTTPException(status_code=404, detail="Sender not found")

        job = await sync_to_async(JobPost.objects.select_related("employer").filter(id=job_id).first)()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        receiver = job.employer

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

        if file:
            safe_filename = file.filename.replace("..", "").replace("/", "").replace("\\", "")
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{timestamp}_{safe_filename}"
            save_path = CHAT_FILES_DIR / filename
            
            with open(save_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            file_path = f"chat_files/{filename}"

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

        msg = await sync_to_async(Message.objects.create)(
            conversation=convo,
            sender=sender,
            content=final_content,
            file=file_path,
            message_type=message_type
        )

        base_url = "http://localhost:8000"
        file_url = f"{base_url}/media/{file_path}".replace("\\", "/") if file_path else None

        await manager.send_personal_message({
            "type": "new_message",
            "sender_id": sender_id,
            "receiver_id": receiver.id,
            "message_id": msg.id,
            "content": final_content,
            "file_url": file_url,
            "message_type": message_type
        }, receiver.id)

        return {
            "status": "success",
            "conversation_id": convo.id,
            "message_id": msg.id,
            "receiver_id": receiver.id,
            "file_url": file_url,
            "file_name": file.filename if file else None,
            "message_type": message_type,
            "created_at": msg.created_at.isoformat()
        }
    except Exception as e:
        print(f"Error in send_message_for_proposal: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

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
        
        print(f"📊 Unread message count for user {current_user_id}: {total_unread}")
        
        return {"count": total_unread}
        
    except Exception as e:
        print(f"❌ Error fetching unread message count: {str(e)}")
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
    Useful for the message list page to show unread badges per conversation.
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
            # Determine the other user in the conversation
            other_user = convo.user2 if convo.user1_id == current_user_id else convo.user1
            
            # Get last message
            last_msg = await sync_to_async(convo.messages.order_by("-created_at").first)()
            
            # Get unread count (messages not seen and not sent by current user)
            unread_count = await sync_to_async(convo.messages.filter(
                is_seen=False
            ).exclude(
                sender_id=current_user_id
            ).count)()
            
            # Check if other user is online
            online = False
            if other_user.last_active:
                online = (now - other_user.last_active) <= timedelta(seconds=60)
            
            # Get profile picture URL
            profile_url = None
            if hasattr(other_user, "profile_picture") and other_user.profile_picture:
                profile_url = f"{request.base_url}media/{other_user.profile_picture}".replace("\\", "/")
            
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
        
        # Sort by most recent message first
        result.sort(
            key=lambda x: x.get('last_message', {}).get('created_at', '') or '',
            reverse=True
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching conversations: {str(e)}")
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
        
        print(f"👁️ Marked {total_updated} messages as read for user {user_id}")
        
        return {
            "status": "success",
            "message": f"{total_updated} messages marked as read",
            "count": total_updated
        }
        
    except Exception as e:
        print(f"❌ Error marking all messages as read: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/download/{file_type}/{filename}")   
async def download_file(file_type: str, filename: str):
    """
    Download a file from message_files or chat_files directory
    
    Args:
        file_type: Either "message_files" or "chat_files"
        filename: Name of the file to download
    """
    try:
        # Determine the file path based on type
        if file_type == "message_files":
            file_path = MESSAGE_FILES_DIR / filename
        elif file_type == "chat_files":
            file_path = CHAT_FILES_DIR / filename
        else:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Check if file exists
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get MIME type
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type:
            mime_type = "application/octet-stream"
        
        # Return file with proper headers
        return FileResponse(
            path=file_path,
            media_type=mime_type,
            filename=filename,
            headers={
                "Access-Control-Allow-Origin": "*",  # Allow any origin
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

# Optional: Add OPTIONS handler for CORS preflight
@router.options("/download/{file_type}/{filename}")
async def download_file_options():
    return Response(
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )
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
        print(f"❌ Error editing message: {str(e)}")
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
        print(f"❌ Error in reaction: {str(e)}")
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
        print(f"❌ Error getting reactions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))