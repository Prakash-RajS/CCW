# fastapi_app/routes/reviews.py
import fastapi_app.django_setup

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from creator_app.models import Review, UserData, Contract

router = APIRouter(prefix="/reviews", tags=["Reviews"])


# =========================================================
# CREATE OR UPDATE REVIEW
# =========================================================
@router.post("/create")
def create_or_update_review(
    reviewer_id: int = Query(...),
    recipient_id: int = Query(...),
    rating: int = Query(..., ge=1, le=5),
    comment: Optional[str] = Query(None),
):
    try:
        reviewer = UserData.objects.get(id=reviewer_id)
        recipient = UserData.objects.get(id=recipient_id)
        
        # Check if users have completed contract
        contract_exists = Contract.objects.filter(
            status="completed",
            creator=reviewer,
            collaborator=recipient
        ).exists() or Contract.objects.filter(
            status="completed",
            creator=recipient,
            collaborator=reviewer
        ).exists()
        
        if not contract_exists:
            raise HTTPException(
                status_code=403,
                detail="You can only review users you have completed contracts with."
            )
        
        # Check if review already exists
        existing_review = Review.objects.filter(
            reviewer=reviewer,
            recipient=recipient
        ).first()
        
        if existing_review:
            existing_review.rating = rating
            existing_review.comment = comment if comment else existing_review.comment
            existing_review.save()
            
            return {
                "message": "Review updated successfully",
                "review_id": existing_review.id,
            }
        else:
            review = Review.objects.create(
                reviewer=reviewer,
                recipient=recipient,
                rating=rating,
                comment=comment or ""
            )
            
            return {
                "message": "Review created successfully",
                "review_id": review.id,
            }
            
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# GET REVIEWS BY RECIPIENT
# =========================================================
@router.get("/recipient/{user_id}")
def get_reviews_by_recipient(user_id: int):
    try:
        UserData.objects.get(id=user_id)
        
        reviews = Review.objects.filter(
            recipient_id=user_id
        ).select_related('reviewer')
        
        data = []
        for review in reviews:
            data.append({
                "id": review.id,
                "reviewer": {
                    "id": review.reviewer.id,
                    "first_name": review.reviewer.first_name,
                    "last_name": review.reviewer.last_name,
                },
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at.isoformat(),
                "updated_at": review.updated_at.isoformat(),
            })
        
        return {
            "recipient_id": user_id,
            "reviews": data
        }
        
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# UPDATE REVIEW
# =========================================================
@router.put("/{review_id}")
def update_review(
    review_id: int,
    rating: Optional[int] = Query(None, ge=1, le=5),
    comment: Optional[str] = Query(None),
):
    try:
        review = Review.objects.get(id=review_id)
        
        if rating is not None:
            review.rating = rating
        
        if comment is not None:
            review.comment = comment
        
        review.save()
        
        return {
            "message": "Review updated successfully",
            "review_id": review.id
        }
        
    except Review.DoesNotExist:
        raise HTTPException(status_code=404, detail="Review not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# DELETE REVIEW
# =========================================================
@router.delete("/{review_id}")
def delete_review(review_id: int):
    try:
        review = Review.objects.get(id=review_id)
        review.delete()
        
        return {
            "message": "Review deleted successfully",
        }
        
    except Review.DoesNotExist:
        raise HTTPException(status_code=404, detail="Review not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))