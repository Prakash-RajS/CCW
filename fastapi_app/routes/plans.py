import fastapi_app.django_setup
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from creator_app.models import SubscriptionPlan, UserData

# ✅ Import verify_admin to secure the routes
from fastapi_app.routes.admin_dashboard import verify_admin

router = APIRouter(prefix="/plans", tags=["Subscription Plans"])

# =========================================
# SCHEMAS (Data Validation)
# =========================================

# Schema for CREATING a plan
class CreatePlanSchema(BaseModel):
    name: str
    price: float
    duration: str  # "monthly", "yearly", "lifetime"
    # expiry_date: Optional[datetime] = None
    features: List[str]
    # ✅ ADDED LIMITS (Fixes Swagger not sending data)
    limits: Dict[str, int] 

# Schema for EDITING a plan
class EditPlanSchema(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[str] = None
    # expiry_date: Optional[datetime] = None
    features: Optional[List[str]] = None
    # ✅ ADDED OPTIONAL LIMITS
    limits: Optional[Dict[str, int]] = None

# =========================================
# 1. ADMIN – CREATE PLAN (POST)
# =========================================
@router.post("/admin/create-plan")
def create_plan(
    plan_data: CreatePlanSchema, 
    admin: UserData = Depends(verify_admin)
):
    try:
        # Check if Name + Duration already exists
        if SubscriptionPlan.objects.filter(
            name=plan_data.name, 
            duration=plan_data.duration.lower()
        ).exists():
            raise HTTPException(
                status_code=400, 
                detail=f"Plan '{plan_data.name}' with duration '{plan_data.duration}' already exists"
            )

        # Create the plan
        plan = SubscriptionPlan.objects.create(
            name=plan_data.name,
            price=plan_data.price,
            duration=plan_data.duration.lower(),
            # expiry_date=plan_data.expiry_date,
            features=plan_data.features,
            limits=plan_data.limits,  # ✅ Saving the limits to DB
            is_active=True
        )

        return {
            "message": "Plan created successfully",
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "price": plan.price,
                "duration": plan.duration,
                "features": plan.features,
                "limits": plan.limits
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# 2. ADMIN – EDIT PLAN (PUT)
# =========================================
@router.put("/admin/edit-plan/{plan_id}")
def edit_plan(
    plan_id: int,
    plan_data: EditPlanSchema, 
    admin: UserData = Depends(verify_admin)
):
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)

        if plan_data.name is not None:
            plan.name = plan_data.name
        if plan_data.price is not None:
            plan.price = plan_data.price
        if plan_data.duration is not None:
            plan.duration = plan_data.duration.lower()
        # if plan_data.expiry_date is not None:
        #     plan.expiry_date = plan_data.expiry_date
        if plan_data.features is not None:
            plan.features = plan_data.features
        
        # ✅ Update limits if provided
        if plan_data.limits is not None:
            plan.limits = plan_data.limits
            
        plan.save()

        return {
            "message": "Plan updated successfully",
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "price": plan.price,
                "duration": plan.duration,
                "features": plan.features,
                "limits": plan.limits
            }
        }

    except SubscriptionPlan.DoesNotExist:
        raise HTTPException(status_code=404, detail="Plan not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# 3. ADMIN – DELETE PLAN (DELETE)
# =========================================
@router.delete("/admin/delete-plan/{plan_id}")
def delete_plan(
    plan_id: int, 
    admin: UserData = Depends(verify_admin)
):
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id)
        plan.delete()
        return {"message": "Plan deleted successfully"}

    except SubscriptionPlan.DoesNotExist:
        raise HTTPException(status_code=404, detail="Plan not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================
# 4. PUBLIC – LIST ACTIVE PLANS (GET)
# =========================================
@router.get("/list")
def list_active_plans():
    # Sort by price so they appear in order
    plans = SubscriptionPlan.objects.filter(is_active=True).order_by("price")

    data = []
    for plan in plans:
        data.append({
            "id": plan.id,
            "name": plan.name,
            "price": float(plan.price),
            "duration": plan.duration,
            # "expiry_date": plan.expiry_date,
            "features": plan.features, 
            "limits": plan.limits # ✅ Return limits to frontend too
        })

    return {"plans": data}

