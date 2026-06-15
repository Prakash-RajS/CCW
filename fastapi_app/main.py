
# #main.py with saving media files on the fastapi

# import sys
# import os
# from pathlib import Path
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from pathlib import Path
# from fastapi_app.routes.auth import router as auth_router
# from fastapi_app.routes.creator import router as creator_router
# from fastapi_app.routes.collaborator import router as collaborator_router
# from fastapi_app.routes.my_profile import router as my_profile_router
# from fastapi_app.routes.message import router as message_router
# from fastapi_app.routes.jobs import router as JobsRouter
# from fastapi_app.routes.payment import router as payment_router
# from fastapi_app.routes.verification import router as verification_router
# from fastapi_app.routes.invitation import router as InvitationRouter
# from fastapi_app.routes.proposal import router as proposal_router
# from fastapi_app.routes.contracts import router as contracts_router
# from fastapi_app.routes.wallet import router as wallet_router
# from fastapi_app.routes.admin_dashboard import router as admin_dashboard_router
# from fastapi_app.routes import user_dashboard
# from fastapi_app.routes import plans
# from fastapi_app.routes import collaborator_financials
# # from fastapi_app.routes import role_selection
# from fastapi_app.routes import portfolio, notification

# # -------------------------------------------------
# # PATH SETUP
# # -------------------------------------------------
# BASE_DIR = Path(__file__).resolve().parent
# PROJECT_ROOT = BASE_DIR.parent
# sys.path.insert(0, str(PROJECT_ROOT))


# # -------------------------------------------------
# # APP INIT
# # -------------------------------------------------
# app = FastAPI()

# # -------------------------------------------------
# # CORS CONFIG
# # -------------------------------------------------
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "http://127.0.0.1:5173"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # -------------------------------------------------
# # MEDIA SETUP (🔥 CORRECT WAY)
# # -------------------------------------------------


# BASE_DIR = Path(__file__).resolve().parent  # fastapi_app folder
# MEDIA_DIR = BASE_DIR / "media"

# MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# app.mount(
#     "/media",
#     StaticFiles(directory=MEDIA_DIR),
#     name="media"
# )

# # -------------------------------------------------
# # ROUTER REGISTRATION
# # -------------------------------------------------
# app.include_router(auth_router)
# app.include_router(creator_router)
# app.include_router(collaborator_router)
# app.include_router(my_profile_router)
# app.include_router(message_router)
# app.include_router(JobsRouter)
# app.include_router(payment_router)
# app.include_router(verification_router)
# app.include_router(InvitationRouter)
# app.include_router(proposal_router)
# app.include_router(contracts_router)
# app.include_router(wallet_router)
# app.include_router(admin_dashboard_router)
# app.include_router(user_dashboard.router)
# app.include_router(plans.router)
# app.include_router(collaborator_financials.router)
# # app.include_router(role_selection.router)
# app.include_router(portfolio.router)
# app.include_router(notification.router)

# # -------------------------------------------------
# # ROOT ENDPOINT
# # -------------------------------------------------
# @app.get("/")
# def home():
#     return {"message": "Welcome to CCW FastAPI"}

# main.py
# FastAPI main application with Django DB connection check and media handling

import sys
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
from fastapi_app.routes.payment import check_subscription_expiry

# -------------------------------------------------
# PATH SETUP
# -------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

# -------------------------------------------------
# IMPORT ROUTERS
# -------------------------------------------------
from fastapi_app.routes.auth import router as auth_router
from fastapi_app.routes.creator import router as creator_router
from fastapi_app.routes.collaborator import router as collaborator_router
from fastapi_app.routes.my_profile import router as my_profile_router
from fastapi_app.routes.message import router as message_router
from fastapi_app.routes.jobs import router as JobsRouter
from fastapi_app.routes.payment import router as payment_router
from fastapi_app.routes.verification import router as verification_router
from fastapi_app.routes.invitation import router as InvitationRouter
from fastapi_app.routes.proposal import router as proposal_router
from fastapi_app.routes.contracts import router as contracts_router
from fastapi_app.routes.wallet import router as wallet_router
from fastapi_app.routes.admin_dashboard import router as admin_dashboard_router
from fastapi_app.routes import user_dashboard
from fastapi_app.routes import plans
from fastapi_app.routes import collaborator_financials
from fastapi_app.routes import portfolio
from fastapi_app.routes import notification
from fastapi_app.routes.dropdown_options import router as dropdown_router
from fastapi_app.routes.review import router as reviews_router

# -------------------------------------------------
# DATABASE CONNECTION CHECK
# -------------------------------------------------
from fastapi_app.routes.dbconnection import ensure_db_connection

# -------------------------------------------------
# APP INIT
# -------------------------------------------------
app = FastAPI()

# -------------------------------------------------
# DATABASE MIDDLEWARE
# -------------------------------------------------
@app.middleware("http")
async def db_connection_middleware(request: Request, call_next):
    """Close stale DB connections before and after each request."""
    from django.db import close_old_connections
    close_old_connections()
    try:
        response = await call_next(request)
    finally:
        close_old_connections()
    return response


# -------------------------------------------------
# CORS CONFIG
# -------------------------------------------------


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------------------------------------
# MEDIA SETUP
# -------------------------------------------------
MEDIA_DIR = BASE_DIR / "media"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/media",
    StaticFiles(directory=MEDIA_DIR),
    name="media"
)

# -------------------------------------------------
# ROUTER REGISTRATION
# -------------------------------------------------
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
app.include_router(portfolio.router)
app.include_router(notification.router)
app.include_router(dropdown_router)
app.include_router(reviews_router)

# -------------------------------------------------
# ROOT ENDPOINT
# -------------------------------------------------
@app.get("/")
def home():
    return {"message": "Welcome to CCW FastAPI"}
 


@app.on_event("startup")
async def start_subscription_checker():

    async def checker_loop():

        while True:

            try:
                await check_subscription_expiry()
            except Exception as e:
                print("Subscription checker error:", e)

            # Every 12 hours
            await asyncio.sleep(43200)

    asyncio.create_task(checker_loop())