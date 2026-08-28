from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from fastapi.security import OAuth2PasswordBearer

from app.db.deps import get_db

from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
)

from app.crud.user import (
    create_user,
    authenticate_user,
    get_user_by_email,
)

from app.core.security import (
    create_access_token,
    decode_access_token,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login/oauth2"
)


# =========================================================
# SIGNUP
# =========================================================

@router.post(
    "/signup",
    response_model=UserResponse,
)
def signup(
    user: UserCreate,
    db: Session = Depends(get_db),
):

    result = create_user(
        db,
        user,
    )

    if result == "EMAIL_EXISTS":
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    if result == "USERNAME_EXISTS":
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    return result


# =========================================================
# NORMAL JSON LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=Token,
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):

    db_user = authenticate_user(
        db,
        user.email,
        user.password,
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# =========================================================
# OAUTH2 LOGIN FOR SWAGGER
# =========================================================

@router.post(
    "/login/oauth2",
    response_model=Token,
)
def login_oauth2(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):

    db_user = authenticate_user(
        db,
        username,
        password,
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        data={
            "sub": db_user.email,
            "role": db_user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):

    payload = decode_access_token(
        token
    )

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    email = payload.get("sub")

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload",
        )

    user = get_user_by_email(
        db,
        email,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user