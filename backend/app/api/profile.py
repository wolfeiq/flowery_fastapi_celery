from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ExtractedScent, ScentMemory, User, ScentProfile
from .auth import get_current_user
from ..services.embeddings import generate_embedding
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal

router = APIRouter()

ALLOWED_INTENSITIES = {"light", "medium", "strong"}

class ProfileUpdate(BaseModel):
    intensity_preference: Optional[Literal["light", "medium", "strong"]] = None
    budget_range: Optional[str] = None
    disliked_notes: Optional[List[str]] = None

    @field_validator("budget_range")
    @classmethod
    def sanitize_budget_range(cls, value):
        if value is None:
            return value
        value = value.strip()
        if len(value) > 50:
            raise ValueError("budget_range must be ≤ 50 characters")
        return value

    @field_validator("disliked_notes")
    @classmethod
    def validate_disliked_notes(cls, notes):
        if notes is None:
            return notes

        if len(notes) > 50:
            raise ValueError("Maximum 50 disliked notes allowed")

        cleaned = []
        for note in notes:
            note = note.strip().lower()
            if not note:
                continue
            if len(note) > 50:
                raise ValueError("Each disliked note must be ≤ 50 characters")
            cleaned.append(note)

        return cleaned

@router.put("/me")
def update_my_profile(
    updates: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ScentProfile).filter_by(
        user_id=current_user.id
    ).first()

    if not profile:
        profile = ScentProfile(user_id=current_user.id)
        db.add(profile)

    if updates.intensity_preference is not None:
        profile.intensity_preference = updates.intensity_preference

    if updates.budget_range is not None:
        profile.budget_range = updates.budget_range

    if updates.disliked_notes is not None:
        profile.disliked_notes = updates.disliked_notes
        flag_modified(profile, "disliked_notes")

    db.commit()
    return {"status": "updated"}



@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(ScentProfile).filter_by(user_id=current_user.id).first()
    
    if not profile:
        return {
            "message": "No profile yet",
            "preferred_families": [],
            "disliked_notes": [],
            "emotional_preferences": [],
            "top_notes": [],
            "heart_notes": [],
            "base_notes": [],
            "total_memories": 0,
            "total_queries": 0,
            "total_extracted_scents": 0
        }

    top_notes = []
    heart_notes = []
    base_notes = []
    
    if profile.note_occurrence_counts:
        top_layer = profile.note_occurrence_counts.get("top", {})
        top_notes = sorted(
            [{"note": note, "count": count} for note, count in top_layer.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:5]
        
        heart_layer = profile.note_occurrence_counts.get("heart", {})
        heart_notes = sorted(
            [{"note": note, "count": count} for note, count in heart_layer.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:5]
        
        base_layer = profile.note_occurrence_counts.get("base", {})
        base_notes = sorted(
            [{"note": note, "count": count} for note, count in base_layer.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:5]

    total_extracted_scents = db.query(ExtractedScent).join(ScentMemory).filter(
        ScentMemory.user_id == current_user.id
    ).count()
    
    return {
        "preferred_families": profile.preferred_families or [],
        "disliked_notes": profile.disliked_notes or [],
        "emotional_preferences": profile.emotional_preferences or [],
        "top_notes": top_notes,
        "heart_notes": heart_notes,
        "base_notes": base_notes,
        "total_memories": profile.total_memories,
        "total_queries": profile.total_queries,
        "total_extracted_scents": total_extracted_scents,
        "last_updated": profile.last_updated.isoformat() if profile.last_updated else None
    }