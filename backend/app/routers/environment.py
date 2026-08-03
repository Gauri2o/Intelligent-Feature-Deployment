from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.models.environment import Environment


router = APIRouter(
    prefix="/environments",
    tags=["Environment"]
)


@router.get("/")
def get_environments(
    db: Session = Depends(get_db)
):

    environments = (
        db.query(Environment)
        .all()
    )

    return environments