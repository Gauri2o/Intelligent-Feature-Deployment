from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.crud.user_group_membership import (
    add_user_to_group,
    get_user_groups,
    get_all_groups,
    is_user_in_group,
    remove_user_from_group,
)


router = APIRouter(
    prefix="/groups",
    tags=["User Groups"],
)


# =========================================================
# ADD USER TO GROUP
# =========================================================

@router.post("/membership")
def add_membership(
    user_id: str,
    group_name: str,
    db: Session = Depends(get_db),
):
    membership = add_user_to_group(
        db=db,
        user_id=user_id,
        group_name=group_name,
    )

    return {
        "message": "User added to group successfully",
        "user_id": membership.user_id,
        "group_name": membership.group_name,
    }


# =========================================================
# GET USER GROUPS
# =========================================================

@router.get("/user/{user_id}")
def get_user_group_list(
    user_id: str,
    db: Session = Depends(get_db),
):
    memberships = get_user_groups(
        db=db,
        user_id=user_id,
    )

    return [
        {
            "id": membership.id,
            "user_id": membership.user_id,
            "group_name": membership.group_name,
        }
        for membership in memberships
    ]


# =========================================================
# GET ALL GROUPS
# =========================================================

@router.get("/")
def get_groups(
    db: Session = Depends(get_db),
):
    return {
        "groups": get_all_groups(db)
    }


# =========================================================
# CHECK USER GROUP MEMBERSHIP
# =========================================================

@router.get("/check")
def check_membership(
    user_id: str,
    group_name: str,
    db: Session = Depends(get_db),
):
    is_member = is_user_in_group(
        db=db,
        user_id=user_id,
        group_name=group_name,
    )

    return {
        "user_id": user_id,
        "group_name": group_name,
        "is_member": is_member,
    }


# =========================================================
# REMOVE USER FROM GROUP
# =========================================================

@router.delete("/membership")
def remove_membership(
    user_id: str,
    group_name: str,
    db: Session = Depends(get_db),
):
    membership = remove_user_from_group(
        db=db,
        user_id=user_id,
        group_name=group_name,
    )

    if not membership:
        raise HTTPException(
            status_code=404,
            detail="User is not a member of this group",
        )

    return {
        "message": "User removed from group successfully"
    }