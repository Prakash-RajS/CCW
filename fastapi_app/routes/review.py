import fastapi_app.django_setup

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from fastapi_app.routes.dbconnection import ensure_db_connection
from fastapi_app.services.notification_service import create_notification

from creator_app.models import Review, UserData, Contract

router = APIRouter(prefix="/reviews", tags=["Reviews"])


# =========================================================
# CREATE OR UPDATE REVIEW
# =========================================================
@router.post("/create")
def create_or_update_review(
    reviewer_id: int = Query(...),
    recipient_id: int = Query(...),
    contract_id: int = Query(...),
    rating: int = Query(..., ge=1, le=5),
    comment: Optional[str] = Query(None),
):
    try:
        ensure_db_connection()
        reviewer = UserData.objects.get(id=reviewer_id)
        recipient = UserData.objects.get(id=recipient_id)
        contract = Contract.objects.get(id=contract_id)

        # Contract must be completed
        if contract.status != "completed":
            raise HTTPException(
                status_code=403,
                detail="You can only leave a review for completed contracts."
            )

        # Determine which direction this review is:
        is_collaborator_reviewing_creator = (
            contract.collaborator == reviewer and contract.creator == recipient
        )
        is_creator_reviewing_collaborator = (
            contract.creator == reviewer and contract.collaborator == recipient
        )

        if not is_collaborator_reviewing_creator and not is_creator_reviewing_collaborator:
            raise HTTPException(
                status_code=403,
                detail="You can only review the other party involved in your completed contract."
            )

        # One review per contract per reviewer
        existing_review = Review.objects.filter(
            reviewer=reviewer,
            contract=contract
        ).first()

        is_new_review = existing_review is None

        if existing_review:
            existing_review.rating = rating
            existing_review.comment = comment if comment else existing_review.comment
            existing_review.save()
            review_id = existing_review.id
            message = "Review updated successfully"
        else:
            review = Review.objects.create(
                reviewer=reviewer,
                recipient=recipient,
                contract=contract,
                rating=rating,
                comment=comment or ""
            )
            review_id = review.id
            message = "Review created successfully"

        # --- Send notification to recipient only on new review ---
        if is_new_review:
            reviewer_name = reviewer.full_name or reviewer.email.split("@")[0]
            job_title = contract.job.title if contract.job else "project"

            # Determine recipient's role and set appropriate URL
            # Check if recipient is a creator or collaborator based on the contract
            if contract.creator == recipient:
                # Recipient is the creator
                redirect_url = "/creator-edit-profile"
            elif contract.collaborator == recipient:
                # Recipient is the collaborator
                redirect_url = "/ColabProfile"
            else:
                pass

            create_notification(
                user=recipient,
                sender=reviewer,
                notification_type="review",
                title=f"New review from {reviewer_name}",
                message=f"{reviewer_name} left a {rating}-star review for your work on '{job_title}'",
                contract=contract,
                job=contract.job,
                url=redirect_url  # Use role-based URL
            )

        return {"message": message, "review_id": review_id}

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Contract.DoesNotExist:
        raise HTTPException(status_code=404, detail="Contract not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# GET REVIEWS GIVEN BY USER
# =========================================================
@router.get("/given/{user_id}")
def get_reviews_given_by_user(user_id: int):
    try:
        ensure_db_connection()
        reviewer = UserData.objects.get(id=user_id)
        reviews = Review.objects.filter(reviewer=reviewer).select_related('recipient', 'contract')
        data = []
        for review in reviews:
            data.append({
                "id": review.id,
                "recipient_id": review.recipient.id,
                "contract_id": review.contract.id if review.contract else None,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at.isoformat(),
            })
        return {"reviewer_id": user_id, "reviews": data}
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
        ensure_db_connection()

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
                    "full_name": review.reviewer.full_name,
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
        ensure_db_connection()

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
        ensure_db_connection()

        review = Review.objects.get(id=review_id)
        review.delete()

        return {
            "message": "Review deleted successfully",
        }

    except Review.DoesNotExist:
        raise HTTPException(status_code=404, detail="Review not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))