

# import fastapi_app.django_setup
# from fastapi import APIRouter, HTTPException, Depends, Query
# from pydantic import BaseModel
# from typing import List, Optional, Dict, Any
# from datetime import datetime
# from creator_app.models import SubscriptionPlan, UserData, UserSubscription, AdminUser
# from fastapi_app.routes.admin_dashboard import get_current_admin
# from enum import Enum
# import json
# from django.db.models import Q

# # ✅ Import verify_admin to secure the routes
# from fastapi_app.routes.admin_dashboard import verify_admin

# router = APIRouter(prefix="/plans", tags=["Subscription Plans"])

# # =========================================
# # ENUMS & CONSTANTS
# # =========================================

# class PlanStatus(str, Enum):
#     ACTIVE = "active"
#     INACTIVE = "inactive"

# class BillingCycle(str, Enum):
#     MONTHLY = "monthly"
#     YEARLY = "yearly"
#     LIFETIME = "lifetime"



# # =========================================
# # SCHEMAS (Data Validation)
# # =========================================

# class FeatureSchema(BaseModel):
#     title: str
#     description: str
#     is_active: bool = True

# # Schema for CREATING a plan
# class CreatePlanSchema(BaseModel):
#     name: str
#     role: str 
#     price: float
#     billing_cycle: BillingCycle
#     max_users: int
#     max_upload_storage_gb: int
#     max_proposals: int
#     max_job_posts: int
#     max_invitations: int  # Added
#     max_contracts: int     # Added
#     description: str
#     is_popular: bool = False
#     status: PlanStatus = PlanStatus.ACTIVE
#     features: List[FeatureSchema]
#     discount_code: Optional[str] = None
#     discount_percentage: Optional[int] = 0
#     discount_description: Optional[str] = None

# # Schema for EDITING a plan
# class EditPlanSchema(BaseModel):
#     name: Optional[str] = None
#     price: Optional[float] = None
#     billing_cycle: Optional[BillingCycle] = None
#     role: Optional[str] = None
#     max_users: Optional[int] = None
#     max_upload_storage_gb: Optional[int] = None
#     max_proposals: Optional[int] = None
#     max_job_posts: Optional[int] = None
#     max_invitations: Optional[int] = None  # Added
#     max_contracts: Optional[int] = None     # Added
#     description: Optional[str] = None
#     is_popular: Optional[bool] = None
#     status: Optional[PlanStatus] = None
#     features: Optional[List[FeatureSchema]] = None
#     discount_code: Optional[str] = None
#     discount_percentage: Optional[int] = None
#     discount_description: Optional[str] = None

# # Schema for RESPONSE
# class PlanResponseSchema(BaseModel):
#     id: int
#     name: str
#     role: str
#     price: float
#     billing_cycle: str
#     max_users: int
#     max_upload_storage_gb: int
#     max_proposals: int
#     max_job_posts: int
#     max_invitations: int   # Added
#     max_contracts: int      # Added
#     description: str
#     is_popular: bool
#     status: str
#     features: List[Dict[str, Any]]
#     discount_code: Optional[str] = None
#     discount_percentage: Optional[int] = 0
#     discount_description: Optional[str] = None
#     discounted_price: float
#     user_count: int = 0
#     created_at: datetime
#     updated_at: datetime
#     created_by: Optional[str] = None
#     updated_by: Optional[str] = None

#     class Config:
#         from_attributes = True

# # =========================================
# # 1. ADMIN – CREATE PLAN (POST)
# # =========================================
# @router.post("/admin/create-plan", response_model=PlanResponseSchema)
# def create_plan(
#     plan_data: CreatePlanSchema, 
#     admin = Depends(get_current_admin)
# ):
#     try:
#         # Check if Name + Billing Cycle already exists
#         if SubscriptionPlan.objects.filter(
#     name=plan_data.name,
#     role=plan_data.role,
#     duration=plan_data.billing_cycle.value
# ).exists():
#             raise HTTPException(
#                 status_code=400, 
# detail=f"Plan '{plan_data.name}' for role '{plan_data.role}' with billing cycle '{plan_data.billing_cycle.value}' already exists"            )


#         # Prepare features as JSON list
#         features_data = [
#             {
#                 "title": feature.title,
#                 "description": feature.description,
#                 "is_active": feature.is_active
#             }
#             for feature in plan_data.features
#         ]

#         # Prepare limits as JSON - Added max_invitations and max_contracts
#         limits_data = {
#             "max_users": plan_data.max_users,
#             "max_upload_storage_gb": plan_data.max_upload_storage_gb,
#             "max_proposals": plan_data.max_proposals,
#             "max_job_posts": plan_data.max_job_posts,
#             "max_invitations": plan_data.max_invitations,   # Added
#             "max_contracts": plan_data.max_contracts         # Added
#         }

#         # Create the plan with role field
#         plan = SubscriptionPlan.objects.create(
#             name=plan_data.name,
#             role=plan_data.role,
#             price=plan_data.price,
#             duration=plan_data.billing_cycle.value,
#             description=plan_data.description,
#             is_popular=plan_data.is_popular,
#             is_active=(plan_data.status == PlanStatus.ACTIVE),
#             features=features_data,
#             limits=limits_data,
#             created_by=admin.email,
#             updated_by=admin.email,
#             discount_code=plan_data.discount_code,
#             discount_percentage=plan_data.discount_percentage,
#             discount_description=plan_data.discount_description
#         )

#         # Count users on this plan
#         user_count = UserSubscription.objects.filter(
#             Q(current_plan__iexact=plan.name) | Q(plan_name__iexact=plan.name),
#             status__in=['active', 'trialing']
#         ).count()

#         # Prepare response data
#         response_data = {
#             "id": plan.id,
#             "name": plan.name,
#             "role": plan.role,
#             "price": float(plan.price),
#             "billing_cycle": plan.duration,
#             "max_users": plan.limits.get("max_users", 0),
#             "max_upload_storage_gb": plan.limits.get("max_upload_storage_gb", 0),
#             "max_proposals": plan.limits.get("max_proposals", 0),
#             "max_job_posts": plan.limits.get("max_job_posts", 0),
#             "max_invitations": plan.limits.get("max_invitations", 0),   # Added
#             "max_contracts": plan.limits.get("max_contracts", 0),         # Added
#             "description": plan.description,
#             "is_popular": plan.is_popular,
#             "status": "active" if plan.is_active else "inactive",
#             "features": plan.features,
#             "discount_code": plan.discount_code,
#             "discount_percentage": plan.discount_percentage,
#             "discount_description": plan.discount_description,
#             "discounted_price": float(plan.discounted_price),
#             "user_count": user_count,
#             "created_at": plan.created_at,
#             "updated_at": plan.updated_at,
#             "created_by": plan.created_by,
#             "updated_by": plan.updated_by
#         }

#         return response_data

#     except HTTPException:
#         raise
#     except Exception as e:
#         # print(f"Error creating plan: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# # =========================================
# # 2. ADMIN – EDIT PLAN (PUT)
# # =========================================
# @router.put("/admin/edit-plan/{plan_id}", response_model=PlanResponseSchema)
# def edit_plan(
#     plan_id: int,
#     plan_data: EditPlanSchema, 
#     admin = Depends(get_current_admin)
# ):
#     try:
#         plan = SubscriptionPlan.objects.get(id=plan_id)

#         # Update basic fields
#         if plan_data.name is not None:
#             plan.name = plan_data.name
#         if plan_data.price is not None:
#             plan.price = plan_data.price
#         if plan_data.billing_cycle is not None:
#             plan.duration = plan_data.billing_cycle.value
#         if plan_data.role is not None:
#             plan.role = plan_data.role
#         if plan_data.description is not None:
#             plan.description = plan_data.description
#         if plan_data.is_popular is not None:
#             plan.is_popular = plan_data.is_popular
#         if plan_data.status is not None:
#             plan.is_active = (plan_data.status == PlanStatus.ACTIVE)
        
#         # Update discount fields
#         if plan_data.discount_code is not None:
#             plan.discount_code = plan_data.discount_code
#         if plan_data.discount_percentage is not None:
#             plan.discount_percentage = plan_data.discount_percentage
#         if plan_data.discount_description is not None:
#             plan.discount_description = plan_data.discount_description

#         # Update limits if provided - Added max_invitations and max_contracts
#         if any([
#             plan_data.max_users is not None,
#             plan_data.max_upload_storage_gb is not None,
#             plan_data.max_proposals is not None,
#             plan_data.max_job_posts is not None,
#             plan_data.max_invitations is not None,   # Added
#             plan_data.max_contracts is not None       # Added
#         ]):
#             current_limits = plan.limits.copy() if plan.limits else {}
#             if plan_data.max_users is not None:
#                 current_limits["max_users"] = plan_data.max_users
#             if plan_data.max_upload_storage_gb is not None:
#                 current_limits["max_upload_storage_gb"] = plan_data.max_upload_storage_gb
#             if plan_data.max_proposals is not None:
#                 current_limits["max_proposals"] = plan_data.max_proposals
#             if plan_data.max_job_posts is not None:
#                 current_limits["max_job_posts"] = plan_data.max_job_posts
#             if plan_data.max_invitations is not None:   # Added
#                 current_limits["max_invitations"] = plan_data.max_invitations
#             if plan_data.max_contracts is not None:      # Added
#                 current_limits["max_contracts"] = plan_data.max_contracts
#             plan.limits = current_limits

#         # Update features if provided
#         if plan_data.features is not None:
#             features_data = [
#                 {
#                     "title": feature.title,
#                     "description": feature.description,
#                     "is_active": feature.is_active
#                 }
#                 for feature in plan_data.features
#             ]
#             plan.features = features_data

#         # Update admin info
#         plan.updated_by = admin.email
#         plan.save()

#         # Count users on this plan
#         user_count = UserSubscription.objects.filter(
#             Q(current_plan__iexact=plan.name) | Q(plan_name__iexact=plan.name),
#             status__in=['active', 'trialing']
#         ).count()

#         # Prepare response data
#         response_data = {
#             "id": plan.id,
#             "name": plan.name,
#             "price": float(plan.price),
#             "billing_cycle": plan.duration,
#             "role": plan.role,
#             "max_users": plan.limits.get("max_users", 0),
#             "max_upload_storage_gb": plan.limits.get("max_upload_storage_gb", 0),
#             "max_proposals": plan.limits.get("max_proposals", 0),
#             "max_job_posts": plan.limits.get("max_job_posts", 0),
#             "max_invitations": plan.limits.get("max_invitations", 0),   # Added
#             "max_contracts": plan.limits.get("max_contracts", 0),         # Added
#             "description": plan.description,
#             "is_popular": plan.is_popular,
#             "status": "active" if plan.is_active else "inactive",
#             "features": plan.features,
#             "discount_code": plan.discount_code,
#             "discount_percentage": plan.discount_percentage,
#             "discount_description": plan.discount_description,
#             "discounted_price": float(plan.discounted_price),
#             "user_count": user_count,
#             "created_at": plan.created_at,
#             "updated_at": plan.updated_at,
#             "created_by": plan.created_by,
#             "updated_by": plan.updated_by
#         }

#         return response_data

#     except SubscriptionPlan.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Plan not found")
#     except Exception as e:
#         # print(f"Error updating plan: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# # =========================================
# # 3. ADMIN – DELETE PLAN (DELETE)
# # =========================================
# @router.delete("/admin/delete-plan/{plan_id}")
# def delete_plan(
#     plan_id: int, 
#     admin = Depends(get_current_admin)
# ):
#     try:
#         plan = SubscriptionPlan.objects.get(id=plan_id)
#         plan.delete()
#         return {"message": "Plan deleted successfully"}

#     except SubscriptionPlan.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Plan not found")
#     except Exception as e:
#         # print(f"Error deleting plan: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# # =========================================
# # 4. PUBLIC – LIST ACTIVE PLANS (GET)
# # =========================================
# @router.get("/list")
# def list_active_plans(
#     role: Optional[str] = Query(None),
#     duration: Optional[str] = Query(None, description="Filter by duration: monthly, yearly, lifetime"),
#     is_active: Optional[bool] = Query(True, description="Filter by active status"),
# ):
#     """
#     List all active subscription plans.
#     Optionally filter by duration, status, and role.
#     """
#     try:
#         # Start with base query
#         query = SubscriptionPlan.objects.all()
        
#         if role:
#             query = query.filter(role__iexact=role)
            
#         # Apply filters
#         if is_active is not None:
#             query = query.filter(is_active=is_active)
        
#         if duration:
#             query = query.filter(duration__iexact=duration.lower())
        
        
#         # Sort by price so they appear in order
#         query = query.order_by("price")
        
#         data = []
#         for plan in query:
#             # Safely get limits with defaults
#             limits = plan.limits or {}
            
#             # Get features - ensure they're in the right format
#             features = plan.features or []
#             if isinstance(features, str):
#                 try:
#                     features = json.loads(features)
#                 except:
#                     features = []
            
#             # Calculate discounted price
#             discounted_price = float(plan.price)
#             if plan.discount_percentage and plan.discount_percentage > 0:
#                 discount = (plan.discount_percentage / 100) * float(plan.price)
#                 discounted_price = float(plan.price) - discount
            
#             # Count users on this plan
#             user_count = UserSubscription.objects.filter(
#                 Q(current_plan__iexact=plan.name) | Q(plan_name__iexact=plan.name),
#                 status__in=['active', 'trialing']
#             ).count()
            
#             data.append({
#                 "id": plan.id,
#                 "name": plan.name,
#                 "price": float(plan.price) if plan.price else 0.0,
#                 "duration": plan.duration,
#                 "role": plan.role or "both",
#                 "description": plan.description or "",
#                 "is_popular": plan.is_popular,
#                 "is_active": plan.is_active,
#                 "max_users": limits.get("max_users", 0),
#                 "max_upload_storage_gb": limits.get("max_upload_storage_gb", 0),
#                 "max_proposals": limits.get("max_proposals", 0),
#                 "max_job_posts": limits.get("max_job_posts", 0),
#                 "max_invitations": limits.get("max_invitations", 0),   # Added
#                 "max_contracts": limits.get("max_contracts", 0),         # Added
#                 "features": features,
#                 "discount_code": plan.discount_code,
#                 "discount_percentage": plan.discount_percentage,
#                 "discount_description": plan.discount_description,
#                 "discounted_price": round(discounted_price, 2),
#                 "user_count": user_count,
#                 "has_discount": plan.discount_code is not None and plan.discount_percentage > 0,
#                 "created_at": plan.created_at,
#                 "updated_at": plan.updated_at,
#                 "created_by": plan.created_by or "",
#                 "updated_by": plan.updated_by or ""
#             })

#         return {"plans": data}
    
#     except Exception as e:
#         # print(f"Error in list_active_plans: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# # =========================================
# # 5. ADMIN – LIST ALL PLANS (with status)
# # =========================================
# @router.get("/admin/list-all")
# def list_all_plans(admin: AdminUser = Depends(get_current_admin)):
#     # Get all plans ordered by creation date
#     plans = SubscriptionPlan.objects.all().order_by("-created_at")

#     data = []
#     for plan in plans:
#         # Count users on this plan
#         user_count = UserSubscription.objects.filter(
#             Q(current_plan__iexact=plan.name) | Q(plan_name__iexact=plan.name),
#             status__in=['active', 'trialing']
#         ).count()
        
#         data.append({
#             "id": plan.id,
#             "name": plan.name,
#             "price": float(plan.price),
#             "billing_cycle": plan.duration,
#             "role": plan.role or "both",
#             "max_users": plan.limits.get("max_users", 0) if plan.limits else 0,
#             "max_upload_storage_gb": plan.limits.get("max_upload_storage_gb", 0) if plan.limits else 0,
#             "max_proposals": plan.limits.get("max_proposals", 0) if plan.limits else 0,
#             "max_job_posts": plan.limits.get("max_job_posts", 0) if plan.limits else 0,
#             "max_invitations": plan.limits.get("max_invitations", 0) if plan.limits else 0,   # Added
#             "max_contracts": plan.limits.get("max_contracts", 0) if plan.limits else 0,         # Added
#             "description": plan.description,
#             "is_popular": plan.is_popular,
#             "status": "active" if plan.is_active else "inactive",
#             "features": plan.features or [],
#             "discount_code": plan.discount_code,
#             "discount_percentage": plan.discount_percentage,
#             "discount_description": plan.discount_description,
#             "discounted_price": float(plan.discounted_price),
#             "user_count": user_count,
#             "created_at": plan.created_at,
#             "updated_at": plan.updated_at,
#             "created_by": plan.created_by,
#             "updated_by": plan.updated_by
#         })

#     return {"plans": data}

# # =========================================
# # 6. ADMIN – GET SINGLE PLAN
# # =========================================
# @router.get("/admin/get-plan/{plan_id}")
# def get_plan(plan_id: int, admin = Depends(get_current_admin)):
#     try:
#         plan = SubscriptionPlan.objects.get(id=plan_id)
        
#         # Count users on this plan
#         user_count = UserSubscription.objects.filter(
#             Q(current_plan__iexact=plan.name) | Q(plan_name__iexact=plan.name),
#             status__in=['active', 'trialing']
#         ).count()
        
#         return {
#             "id": plan.id,
#             "name": plan.name,
#             "price": float(plan.price),
#             "billing_cycle": plan.duration,
#             "role": plan.role or "both",
#             "max_users": plan.limits.get("max_users", 0) if plan.limits else 0,
#             "max_upload_storage_gb": plan.limits.get("max_upload_storage_gb", 0) if plan.limits else 0,
#             "max_proposals": plan.limits.get("max_proposals", 0) if plan.limits else 0,
#             "max_job_posts": plan.limits.get("max_job_posts", 0) if plan.limits else 0,
#             "max_invitations": plan.limits.get("max_invitations", 0) if plan.limits else 0,   # Added
#             "max_contracts": plan.limits.get("max_contracts", 0) if plan.limits else 0,         # Added
#             "description": plan.description,
#             "is_popular": plan.is_popular,
#             "status": "active" if plan.is_active else "inactive",
#             "features": plan.features or [],
#             "discount_code": plan.discount_code,
#             "discount_percentage": plan.discount_percentage,
#             "discount_description": plan.discount_description,
#             "discounted_price": float(plan.discounted_price),
#             "user_count": user_count,
#             "created_at": plan.created_at,
#             "updated_at": plan.updated_at,
#             "created_by": plan.created_by,
#             "updated_by": plan.updated_by
#         }
        
#     except SubscriptionPlan.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Plan not found")
#     except Exception as e:
#         # print(f"Error getting plan: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))


import fastapi_app.django_setup
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from creator_app.models import SubscriptionPlan, UserData, UserSubscription, AdminUser, AdminNotification
from fastapi_app.routes.admin_dashboard import get_current_admin
from enum import Enum
import json
from django.db.models import Q

# ✅ Import verify_admin to secure the routes
from fastapi_app.routes.admin_dashboard import verify_admin

router = APIRouter(prefix="/plans", tags=["Subscription Plans"])

# =========================================
# ENUMS & CONSTANTS
# =========================================

class PlanStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"
    LIFETIME = "lifetime"


# =========================================
# SCHEMAS (Data Validation)
# =========================================

class FeatureSchema(BaseModel):
    title: str
    description: str
    is_active: bool = True

# Schema for CREATING a plan
class CreatePlanSchema(BaseModel):
    name: str
    role: str 
    price: float
    billing_cycle: BillingCycle
    max_users: int
    max_upload_storage_gb: int
    max_proposals: int
    max_job_posts: int
    max_invitations: int
    max_contracts: int
    description: str
    is_popular: bool = False
    status: PlanStatus = PlanStatus.ACTIVE
    features: List[FeatureSchema]
    discount_code: Optional[str] = None
    discount_percentage: Optional[int] = 0
    discount_description: Optional[str] = None

# Schema for EDITING a plan
class EditPlanSchema(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    billing_cycle: Optional[BillingCycle] = None
    role: Optional[str] = None
    max_users: Optional[int] = None
    max_upload_storage_gb: Optional[int] = None
    max_proposals: Optional[int] = None
    max_job_posts: Optional[int] = None
    max_invitations: Optional[int] = None
    max_contracts: Optional[int] = None
    description: Optional[str] = None
    is_popular: Optional[bool] = None
    status: Optional[PlanStatus] = None
    features: Optional[List[FeatureSchema]] = None
    discount_code: Optional[str] = None
    discount_percentage: Optional[int] = None
    discount_description: Optional[str] = None

# Schema for RESPONSE
class PlanResponseSchema(BaseModel):
    id: int
    name: str
    role: str
    price: float
    billing_cycle: str
    max_users: int
    max_upload_storage_gb: int
    max_proposals: int
    max_job_posts: int
    max_invitations: int
    max_contracts: int
    description: str
    is_popular: bool
    status: str
    features: List[Dict[str, Any]]
    discount_code: Optional[str] = None
    discount_percentage: Optional[int] = 0
    discount_description: Optional[str] = None
    discounted_price: float
    user_count: int = 0
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True


# =========================================
# HELPER: Create plan notification
# =========================================
def create_plan_notification(notification_type: str, title: str, subtitle: str, exclude_admin=None):
    """Safely create a notification for all admins"""
    try:
        admins = AdminUser.objects.all()
        if exclude_admin:
            admins = admins.exclude(id=exclude_admin.id)
        
        created_count = 0
        for admin in admins:
            AdminNotification.objects.create(
                admin=admin,
                notification_type=notification_type,
                title=title,
                subtitle=subtitle
            )
            created_count += 1
        
        # print(f"✅ Created plan notification '{notification_type}' for {created_count} admin(s)")
        return True
    except Exception as e:
        # print(f"⚠️ Notification creation failed (non-critical): {e}")
        return False


# =========================================
# 1. ADMIN – CREATE PLAN (POST)
# =========================================
@router.post("/admin/create-plan", response_model=PlanResponseSchema)
def create_plan(
    plan_data: CreatePlanSchema, 
    admin = Depends(get_current_admin)
):
    try:
        # Check if Name + Role + Duration already exists
        if SubscriptionPlan.objects.filter(
            name=plan_data.name,
            role=plan_data.role,
            duration=plan_data.billing_cycle.value
        ).exists():
            raise HTTPException(
                status_code=400, 
                detail=f"❌ A plan named '{plan_data.name}' for role '{plan_data.role}' with billing cycle '{plan_data.billing_cycle.value}' already exists! Please choose a different name."
            )

        # ✅ Check if Price + Role + Duration already exists
        if SubscriptionPlan.objects.filter(
            price=plan_data.price,
            role=plan_data.role,
            duration=plan_data.billing_cycle.value
        ).exists():
            existing_plan = SubscriptionPlan.objects.filter(
                price=plan_data.price,
                role=plan_data.role,
                duration=plan_data.billing_cycle.value
            ).first()
            
            raise HTTPException(
                status_code=400, 
                detail=f"❌ A plan with price ₹{plan_data.price} for role '{plan_data.role}' with billing cycle '{plan_data.billing_cycle.value}' already exists!\n\nExisting plan: \"{existing_plan.name}\" (₹{existing_plan.price}/{existing_plan.duration})"
            )

        # Prepare features as JSON list
        features_data = [
            {
                "title": feature.title,
                "description": feature.description,
                "is_active": feature.is_active
            }
            for feature in plan_data.features
        ]

        # Prepare limits as JSON
        limits_data = {
            "max_users": plan_data.max_users,
            "max_upload_storage_gb": plan_data.max_upload_storage_gb,
            "max_proposals": plan_data.max_proposals,
            "max_job_posts": plan_data.max_job_posts,
            "max_invitations": plan_data.max_invitations,
            "max_contracts": plan_data.max_contracts
        }

        # Create the plan
        plan = SubscriptionPlan.objects.create(
            name=plan_data.name,
            role=plan_data.role,
            price=plan_data.price,
            duration=plan_data.billing_cycle.value,
            description=plan_data.description,
            is_popular=plan_data.is_popular,
            is_active=(plan_data.status == PlanStatus.ACTIVE),
            features=features_data,
            limits=limits_data,
            created_by=admin.email,
            updated_by=admin.email,
            discount_code=plan_data.discount_code,
            discount_percentage=plan_data.discount_percentage,
            discount_description=plan_data.discount_description
        )

        # Count users on this plan
        user_count = UserSubscription.objects.filter(
            Q(current_plan__iexact=plan.name) | Q(plan_name__iexact=plan.name),
            status__in=['active', 'trialing']
        ).count()

        # 🔔 NOTIFICATION: Plan created
        create_plan_notification(
            notification_type="plan_created",
            title="📋 Subscription Plan Created",
            subtitle=f"Admin {admin.name or admin.email} created plan: {plan.name} (₹{plan.price}/{plan.duration})",
            exclude_admin=None
        )

        # Prepare response data
        response_data = {
            "id": plan.id,
            "name": plan.name,
            "role": plan.role,
            "price": float(plan.price),
            "billing_cycle": plan.duration,
            "max_users": plan.limits.get("max_users", 0),
            "max_upload_storage_gb": plan.limits.get("max_upload_storage_gb", 0),
            "max_proposals": plan.limits.get("max_proposals", 0),
            "max_job_posts": plan.limits.get("max_job_posts", 0),
            "max_invitations": plan.limits.get("max_invitations", 0),
            "max_contracts": plan.limits.get("max_contracts", 0),
            "description": plan.description,
            "is_popular": plan.is_popular,
            "status": "active" if plan.is_active else "inactive",
            "features": plan.features,
            "discount_code": plan.discount_code,
            "discount_percentage": plan.discount_percentage,
            "discount_description": plan.discount_description,
            "discounted_price": float(plan.discounted_price),
            "user_count": user_count,
            "created_at": plan.created_at,
            "updated_at": plan.updated_at,
            "created_by": plan.created_by,
            "updated_by": plan.updated_by
        }

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# 2. ADMIN – EDIT PLAN (PUT)
# =========================================
@router.put("/admin/edit-plan/{plan_id}", response_model=PlanResponseSchema)
def edit_plan(
    plan_id: int,
    plan_data: EditPlanSchema, 
    admin = Depends(get_current_admin)
):
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)
        
        # Track changes for notification
        changes = []
        old_name = plan.name
        old_price = float(plan.price)
        old_status = "active" if plan.is_active else "inactive"
        old_duration = plan.duration
        old_role = plan.role

        # ✅ DETERMINE THE VALUES TO CHECK FOR DUPLICATES
        # Use new values if provided, otherwise use existing values
        check_name = plan_data.name if plan_data.name is not None else plan.name
        check_price = float(plan_data.price) if plan_data.price is not None else float(plan.price)
        check_role = plan_data.role if plan_data.role is not None else plan.role
        check_duration = plan_data.billing_cycle.value if plan_data.billing_cycle is not None else plan.duration

        # ✅ CHECK FOR DUPLICATE BY NAME (excluding current plan)
        if plan_data.name is not None and plan_data.name != plan.name:
            if SubscriptionPlan.objects.filter(
                name=check_name,
                role=check_role,
                duration=check_duration
            ).exclude(id=plan_id).exists():
                raise HTTPException(
                    status_code=400, 
                    detail=f"❌ A plan named '{check_name}' for role '{check_role}' with billing cycle '{check_duration}' already exists! Please choose a different name."
                )

        # ✅ CHECK FOR DUPLICATE BY PRICE (excluding current plan)
        if plan_data.price is not None and float(plan_data.price) != float(plan.price):
            if SubscriptionPlan.objects.filter(
                price=check_price,
                role=check_role,
                duration=check_duration
            ).exclude(id=plan_id).exists():
                existing_plan = SubscriptionPlan.objects.filter(
                    price=check_price,
                    role=check_role,
                    duration=check_duration
                ).exclude(id=plan_id).first()
                
                raise HTTPException(
                    status_code=400, 
                    detail=f"❌ A plan with price ₹{check_price} for role '{check_role}' with billing cycle '{check_duration}' already exists!\n\nExisting plan: \"{existing_plan.name}\" (₹{existing_plan.price}/{existing_plan.duration})"
                )

        # Also check if role or duration changed (in case of name/price change with different role/duration)
        # This catches cases where user changes role or duration along with name/price
        if plan_data.role is not None and plan_data.role != plan.role:
            # Check if new role + name + duration combination exists
            if SubscriptionPlan.objects.filter(
                name=check_name,
                role=check_role,
                duration=check_duration
            ).exclude(id=plan_id).exists():
                raise HTTPException(
                    status_code=400, 
                    detail=f"❌ A plan named '{check_name}' for role '{check_role}' with billing cycle '{check_duration}' already exists!"
                )

        if plan_data.billing_cycle is not None and plan_data.billing_cycle.value != plan.duration:
            # Check if new duration + name + role combination exists
            if SubscriptionPlan.objects.filter(
                name=check_name,
                role=check_role,
                duration=check_duration
            ).exclude(id=plan_id).exists():
                raise HTTPException(
                    status_code=400, 
                    detail=f"❌ A plan named '{check_name}' for role '{check_role}' with billing cycle '{check_duration}' already exists!"
                )

        # ============================================
        # NOW PROCEED WITH UPDATES
        # ============================================

        # Update basic fields and track changes
        if plan_data.name is not None and plan_data.name != plan.name:
            changes.append(f"name: '{plan.name}' → '{plan_data.name}'")
            plan.name = plan_data.name
            
        if plan_data.price is not None and float(plan_data.price) != float(plan.price):
            changes.append(f"price: ₹{plan.price} → ₹{plan_data.price}")
            plan.price = plan_data.price
            
        if plan_data.billing_cycle is not None and plan_data.billing_cycle.value != plan.duration:
            changes.append(f"cycle: '{plan.duration}' → '{plan_data.billing_cycle.value}'")
            plan.duration = plan_data.billing_cycle.value
            
        if plan_data.role is not None and plan_data.role != plan.role:
            changes.append(f"role: '{plan.role}' → '{plan_data.role}'")
            plan.role = plan_data.role
            
        if plan_data.description is not None and plan_data.description != plan.description:
            changes.append("description updated")
            plan.description = plan_data.description
            
        if plan_data.is_popular is not None and plan_data.is_popular != plan.is_popular:
            changes.append(f"popular: {plan.is_popular} → {plan_data.is_popular}")
            plan.is_popular = plan_data.is_popular
            
        if plan_data.status is not None:
            new_status = "active" if plan_data.status == PlanStatus.ACTIVE else "inactive"
            is_active_new = (plan_data.status == PlanStatus.ACTIVE)
            if is_active_new != plan.is_active:
                changes.append(f"status: '{old_status}' → '{new_status}'")
                plan.is_active = is_active_new
        
        # Update discount fields
        if plan_data.discount_code is not None:
            plan.discount_code = plan_data.discount_code
        if plan_data.discount_percentage is not None:
            plan.discount_percentage = plan_data.discount_percentage
        if plan_data.discount_description is not None:
            plan.discount_description = plan_data.discount_description

        # Update limits if provided
        if any([
            plan_data.max_users is not None,
            plan_data.max_upload_storage_gb is not None,
            plan_data.max_proposals is not None,
            plan_data.max_job_posts is not None,
            plan_data.max_invitations is not None,
            plan_data.max_contracts is not None
        ]):
            current_limits = plan.limits.copy() if plan.limits else {}
            if plan_data.max_users is not None:
                current_limits["max_users"] = plan_data.max_users
            if plan_data.max_upload_storage_gb is not None:
                current_limits["max_upload_storage_gb"] = plan_data.max_upload_storage_gb
            if plan_data.max_proposals is not None:
                current_limits["max_proposals"] = plan_data.max_proposals
            if plan_data.max_job_posts is not None:
                current_limits["max_job_posts"] = plan_data.max_job_posts
            if plan_data.max_invitations is not None:
                current_limits["max_invitations"] = plan_data.max_invitations
            if plan_data.max_contracts is not None:
                current_limits["max_contracts"] = plan_data.max_contracts
            plan.limits = current_limits
            changes.append("limits updated")

        # Update features if provided
        if plan_data.features is not None:
            features_data = [
                {
                    "title": feature.title,
                    "description": feature.description,
                    "is_active": feature.is_active
                }
                for feature in plan_data.features
            ]
            plan.features = features_data
            changes.append("features updated")

        # Update admin info
        plan.updated_by = admin.email
        plan.save()

        # Count users on this plan
        user_count = UserSubscription.objects.filter(
            Q(current_plan__iexact=plan.name) | Q(plan_name__iexact=plan.name),
            status__in=['active', 'trialing']
        ).count()

        # 🔔 NOTIFICATION: Plan updated
        if changes:
            # Limit the changes message length
            changes_text = ", ".join(changes[:4])
            if len(changes) > 4:
                changes_text += f" and {len(changes)-4} more"
                
            create_plan_notification(
                notification_type="plan_updated",
                title="✏️ Subscription Plan Updated",
                subtitle=f"Admin {admin.name or admin.email} updated plan '{plan.name}': {changes_text}",
                exclude_admin=None
            )

        # Prepare response data
        response_data = {
            "id": plan.id,
            "name": plan.name,
            "price": float(plan.price),
            "billing_cycle": plan.duration,
            "role": plan.role,
            "max_users": plan.limits.get("max_users", 0) if plan.limits else 0,
            "max_upload_storage_gb": plan.limits.get("max_upload_storage_gb", 0) if plan.limits else 0,
            "max_proposals": plan.limits.get("max_proposals", 0) if plan.limits else 0,
            "max_job_posts": plan.limits.get("max_job_posts", 0) if plan.limits else 0,
            "max_invitations": plan.limits.get("max_invitations", 0) if plan.limits else 0,
            "max_contracts": plan.limits.get("max_contracts", 0) if plan.limits else 0,
            "description": plan.description,
            "is_popular": plan.is_popular,
            "status": "active" if plan.is_active else "inactive",
            "features": plan.features,
            "discount_code": plan.discount_code,
            "discount_percentage": plan.discount_percentage,
            "discount_description": plan.discount_description,
            "discounted_price": float(plan.discounted_price),
            "user_count": user_count,
            "created_at": plan.created_at,
            "updated_at": plan.updated_at,
            "created_by": plan.created_by,
            "updated_by": plan.updated_by
        }

        return response_data

    except SubscriptionPlan.DoesNotExist:
        raise HTTPException(status_code=404, detail="Plan not found")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# 3. ADMIN – DELETE PLAN (DELETE)
# =========================================
@router.delete("/admin/delete-plan/{plan_id}")
def delete_plan(
    plan_id: int, 
    admin = Depends(get_current_admin)
):
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)
        plan_name = plan.name
        plan_price = float(plan.price)
        plan_duration = plan.duration
        
        plan.delete()
        
        # 🔔 NOTIFICATION: Plan deleted
        create_plan_notification(
            notification_type="plan_deleted",
            title="🗑️ Subscription Plan Deleted",
            subtitle=f"Admin {admin.name or admin.email} deleted plan: {plan_name} (₹{plan_price}/{plan_duration})",
            exclude_admin=None
        )
        
        return {"message": "Plan deleted successfully"}

    except SubscriptionPlan.DoesNotExist:
        raise HTTPException(status_code=404, detail="Plan not found")
    except Exception as e:
        # print(f"❌ Error deleting plan: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# 4. PUBLIC – LIST ACTIVE PLANS (GET)
# =========================================
@router.get("/list")
def list_active_plans(
    role: Optional[str] = Query(None),
    duration: Optional[str] = Query(None, description="Filter by duration: monthly, yearly, lifetime"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
):
    """
    List all active subscription plans.
    Optionally filter by duration, status, and role.
    """
    try:
        # Start with base query
        query = SubscriptionPlan.objects.all()
        
        if role:
            query = query.filter(role__iexact=role)
            
        # Apply filters
        if is_active is not None:
            query = query.filter(is_active=is_active)
        
        if duration:
            query = query.filter(duration__iexact=duration.lower())
        
        # Sort by price so they appear in order
        query = query.order_by("price")
        
        data = []
        for plan in query:
            # Safely get limits with defaults
            limits = plan.limits or {}
            
            # Get features - ensure they're in the right format
            features = plan.features or []
            if isinstance(features, str):
                try:
                    features = json.loads(features)
                except:
                    features = []
            
            # Calculate discounted price
            discounted_price = float(plan.price)
            if plan.discount_percentage and plan.discount_percentage > 0:
                discount = (plan.discount_percentage / 100) * float(plan.price)
                discounted_price = float(plan.price) - discount
            
            # Count users on this plan
            user_count = UserSubscription.objects.filter(
                Q(current_plan__iexact=plan.name) | Q(plan_name__iexact=plan.name),
                status__in=['active', 'trialing']
            ).count()
            
            data.append({
                "id": plan.id,
                "name": plan.name,
                "price": float(plan.price) if plan.price else 0.0,
                "duration": plan.duration,
                "role": plan.role or "both",
                "description": plan.description or "",
                "is_popular": plan.is_popular,
                "is_active": plan.is_active,
                "max_users": limits.get("max_users", 0),
                "max_upload_storage_gb": limits.get("max_upload_storage_gb", 0),
                "max_proposals": limits.get("max_proposals", 0),
                "max_job_posts": limits.get("max_job_posts", 0),
                "max_invitations": limits.get("max_invitations", 0),
                "max_contracts": limits.get("max_contracts", 0),
                "features": features,
                "discount_code": plan.discount_code,
                "discount_percentage": plan.discount_percentage,
                "discount_description": plan.discount_description,
                "discounted_price": round(discounted_price, 2),
                "user_count": user_count,
                "has_discount": plan.discount_code is not None and plan.discount_percentage > 0,
                "created_at": plan.created_at,
                "updated_at": plan.updated_at,
                "created_by": plan.created_by or "",
                "updated_by": plan.updated_by or ""
            })

        return {"plans": data}
    
    except Exception as e:
        # print(f"❌ Error in list_active_plans: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# =========================================
# 5. ADMIN – LIST ALL PLANS (with status)
# =========================================
@router.get("/admin/list-all")
def list_all_plans(admin: AdminUser = Depends(get_current_admin)):
    # Get all plans ordered by creation date
    plans = SubscriptionPlan.objects.all().order_by("-created_at")

    data = []
    for plan in plans:
        # Count users on this plan
        user_count = UserSubscription.objects.filter(
            Q(current_plan__iexact=plan.name) | Q(plan_name__iexact=plan.name),
            status__in=['active', 'trialing']
        ).count()
        
        data.append({
            "id": plan.id,
            "name": plan.name,
            "price": float(plan.price),
            "billing_cycle": plan.duration,
            "role": plan.role or "both",
            "max_users": plan.limits.get("max_users", 0) if plan.limits else 0,
            "max_upload_storage_gb": plan.limits.get("max_upload_storage_gb", 0) if plan.limits else 0,
            "max_proposals": plan.limits.get("max_proposals", 0) if plan.limits else 0,
            "max_job_posts": plan.limits.get("max_job_posts", 0) if plan.limits else 0,
            "max_invitations": plan.limits.get("max_invitations", 0) if plan.limits else 0,
            "max_contracts": plan.limits.get("max_contracts", 0) if plan.limits else 0,
            "description": plan.description,
            "is_popular": plan.is_popular,
            "status": "active" if plan.is_active else "inactive",
            "features": plan.features or [],
            "discount_code": plan.discount_code,
            "discount_percentage": plan.discount_percentage,
            "discount_description": plan.discount_description,
            "discounted_price": float(plan.discounted_price),
            "user_count": user_count,
            "created_at": plan.created_at,
            "updated_at": plan.updated_at,
            "created_by": plan.created_by,
            "updated_by": plan.updated_by
        })

    return {"plans": data}


# =========================================
# 6. ADMIN – GET SINGLE PLAN
# =========================================
@router.get("/admin/get-plan/{plan_id}")
def get_plan(plan_id: int, admin = Depends(get_current_admin)):
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)
        
        # Count users on this plan
        user_count = UserSubscription.objects.filter(
            Q(current_plan__iexact=plan.name) | Q(plan_name__iexact=plan.name),
            status__in=['active', 'trialing']
        ).count()
        
        return {
            "id": plan.id,
            "name": plan.name,
            "price": float(plan.price),
            "billing_cycle": plan.duration,
            "role": plan.role or "both",
            "max_users": plan.limits.get("max_users", 0) if plan.limits else 0,
            "max_upload_storage_gb": plan.limits.get("max_upload_storage_gb", 0) if plan.limits else 0,
            "max_proposals": plan.limits.get("max_proposals", 0) if plan.limits else 0,
            "max_job_posts": plan.limits.get("max_job_posts", 0) if plan.limits else 0,
            "max_invitations": plan.limits.get("max_invitations", 0) if plan.limits else 0,
            "max_contracts": plan.limits.get("max_contracts", 0) if plan.limits else 0,
            "description": plan.description,
            "is_popular": plan.is_popular,
            "status": "active" if plan.is_active else "inactive",
            "features": plan.features or [],
            "discount_code": plan.discount_code,
            "discount_percentage": plan.discount_percentage,
            "discount_description": plan.discount_description,
            "discounted_price": float(plan.discounted_price),
            "user_count": user_count,
            "created_at": plan.created_at,
            "updated_at": plan.updated_at,
            "created_by": plan.created_by,
            "updated_by": plan.updated_by
        }
        
    except SubscriptionPlan.DoesNotExist:
        raise HTTPException(status_code=404, detail="Plan not found")
    except Exception as e:
        # print(f"❌ Error getting plan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))