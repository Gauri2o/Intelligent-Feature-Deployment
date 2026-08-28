from sqlalchemy.orm import Session

from app.models.user_group_membership import UserGroupMembership


# =========================================================
# ADD USER TO GROUP
# =========================================================

def add_user_to_group(
    db: Session,
    user_id: str,
    group_name: str,
):
    """
    Add a user to a group.

    Example:
    user_id = "user123"
    group_name = "beta_users"
    """

    # Check whether membership already exists
    existing = (
        db.query(UserGroupMembership)
        .filter(
            UserGroupMembership.user_id == user_id,
            UserGroupMembership.group_name == group_name,
        )
        .first()
    )

    if existing:
        return existing

    membership = UserGroupMembership(
        user_id=user_id,
        group_name=group_name,
    )

    db.add(membership)
    db.commit()
    db.refresh(membership)

    return membership


# =========================================================
# GET USER GROUPS
# =========================================================

def get_user_groups(
    db: Session,
    user_id: str,
):
    """
    Return all groups to which a user belongs.
    """

    memberships = (
        db.query(UserGroupMembership)
        .filter(
            UserGroupMembership.user_id == user_id
        )
        .all()
    )

    return memberships


# =========================================================
# GET ALL GROUPS
# =========================================================

def get_all_groups(
    db: Session,
):
    """
    Return unique group names.
    """

    memberships = (
        db.query(UserGroupMembership.group_name)
        .distinct()
        .all()
    )

    return [
        membership.group_name
        for membership in memberships
    ]


# =========================================================
# CHECK GROUP MEMBERSHIP
# =========================================================

def is_user_in_group(
    db: Session,
    user_id: str,
    group_name: str,
):
    """
    Check whether a user belongs to a particular group.
    """

    membership = (
        db.query(UserGroupMembership)
        .filter(
            UserGroupMembership.user_id == user_id,
            UserGroupMembership.group_name == group_name,
        )
        .first()
    )

    return membership is not None


# =========================================================
# REMOVE USER FROM GROUP
# =========================================================

def remove_user_from_group(
    db: Session,
    user_id: str,
    group_name: str,
):
    """
    Remove a user from a group.
    """

    membership = (
        db.query(UserGroupMembership)
        .filter(
            UserGroupMembership.user_id == user_id,
            UserGroupMembership.group_name == group_name,
        )
        .first()
    )

    if not membership:
        return None

    db.delete(membership)
    db.commit()

    return membership