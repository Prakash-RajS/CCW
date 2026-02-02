#main.py
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi_app.routes.auth import router as auth_router
from fastapi_app.routes.creator import router as creator_router
from fastapi_app.routes.collaborator import router as collaborator_router
from fastapi_app.routes.my_profile import router as my_profile_router
from fastapi_app.routes.message import router as message_router
from fastapi_app.routes.jobs import router as JobsRouter
# ✅ ADD THESE IMPORTS
from fastapi.staticfiles import StaticFiles
from django.conf import settings
from fastapi_app.routes.payment import router as payment_router
from fastapi_app.routes.verification import router as verification_router
from fastapi import FastAPI
from fastapi_app.routes.invitation import router as InvitationRouter
from fastapi_app.routes.proposal import router as proposal_router
from fastapi_app.routes.contracts import router as contracts_router
from fastapi_app.routes.wallet import router as wallet_router
from fastapi_app.routes.admin_dashboard import router as admin_dashboard_router
from fastapi_app.routes import user_dashboard
from fastapi_app.routes import plans
from fastapi_app.routes import collaborator_financials
# from fastapi_app.routes import role_selection
# 1. Import the new router



app = FastAPI()

# 👇 ADD THIS BLOCK RIGHT AFTER app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    # 👇 ADD BOTH LOCALHOST AND 127.0.0.1
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], # 👈 This must be "*" to allow Authorization header
)
app.include_router(auth_router)
app.include_router(creator_router)
app.include_router(collaborator_router)
app.include_router(my_profile_router)
app.include_router(message_router)
app.include_router(JobsRouter)
app.include_router(payment_router)
app.include_router(verification_router)
app.include_router(InvitationRouter)
app.include_router(proposal_router)
app.include_router(contracts_router)
app.include_router(wallet_router)
app.include_router(admin_dashboard_router)
app.include_router(user_dashboard.router)
app.include_router(plans.router)
app.include_router(collaborator_financials.router)
# app.include_router(role_selection.router)

# ✅ MOUNT MEDIA FOLDER (THIS FIXES YOUR 404 ISSUE)
app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")

@app.get("/")
def home():
    return {"message": "Welcome to CCW FastAPI"}





 