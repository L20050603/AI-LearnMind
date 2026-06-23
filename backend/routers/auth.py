from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import AuthLoginRequest, AuthRegisterRequest, AuthResponse, UserPublic
from services.auth_service import authenticate_user, register_user, user_public
from services.security import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(payload: AuthRegisterRequest, db: Session = Depends(get_db)):
    return register_user(db, payload)


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthLoginRequest, db: Session = Depends(get_db)):
    return authenticate_user(db, payload.username, payload.password)


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    return user_public(current_user)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"ok": True, "user_id": current_user.id}
