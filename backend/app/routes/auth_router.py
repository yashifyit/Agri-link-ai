from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

from app.database import get_db
from app.models.all_models import (
    User, UserRole, FarmerProfile, BuyerProfile, FPOProfile, LogisticsProfile
)
from app.services.auth_service import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    decode_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication & Profiles"])

class RegisterRequest(BaseModel):
    name: str
    phone: str
    password: str
    email: Optional[str] = None
    role: str = "FARMER" # FARMER, BUYER, FPO, LOGISTICS, ADMIN
    location: str = "Maharashtra"
    # Specific fields
    business_name: Optional[str] = None
    gstin: Optional[str] = None
    fpo_reg_no: Optional[str] = None
    fleet_type: Optional[str] = None

class LoginRequest(BaseModel):
    username: str # mobile or email
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    identifier: str # email or phone

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Check if phone or email already registered
    existing_phone = db.query(User).filter(User.phone == payload.phone).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Mobile number already registered. Please sign in.")

    if payload.email:
        existing_email = db.query(User).filter(User.email == payload.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered. Please sign in.")

    role_str = payload.role.upper()
    if role_str not in [UserRole.FARMER, UserRole.BUYER, UserRole.FPO, UserRole.LOGISTICS, UserRole.ADMIN]:
        role_str = UserRole.FARMER

    new_user = User(
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        email=payload.email.strip() if payload.email else None,
        password_hash=hash_password(payload.password),
        role=role_str,
        location=payload.location.strip(),
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    db.flush()

    # Create associated role profile
    if role_str == UserRole.FARMER:
        db.add(FarmerProfile(user_id=new_user.id))
    elif role_str == UserRole.BUYER:
        db.add(BuyerProfile(
            user_id=new_user.id,
            company_name=payload.business_name or payload.name,
            gstin=payload.gstin
        ))
    elif role_str == UserRole.FPO:
        db.add(FPOProfile(
            user_id=new_user.id,
            fpo_name=payload.business_name or payload.name,
            registration_no=payload.fpo_reg_no
        ))
    elif role_str == UserRole.LOGISTICS:
        db.add(LogisticsProfile(
            user_id=new_user.id,
            fleet_type=payload.fleet_type or "Mini Trucks & Pickups"
        ))

    access_token = create_access_token({"sub": str(new_user.id), "role": new_user.role, "name": new_user.name})
    refresh_token = create_refresh_token({"sub": str(new_user.id)})
    new_user.refresh_token = refresh_token

    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "User registered successfully",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(new_user.id),
            "name": new_user.name,
            "phone": new_user.phone,
            "email": new_user.email,
            "role": new_user.role,
            "location": new_user.location,
            "is_verified": new_user.is_verified
        }
    }

@router.post("/login")
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    identifier = payload.username.strip()
    user = db.query(User).filter(
        (User.phone == identifier) | (User.email == identifier)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile number or email address"
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account has been suspended or deactivated.")

    access_token = create_access_token({"sub": str(user.id), "role": user.role, "name": user.name})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    user.refresh_token = refresh_token
    db.commit()

    business_name = None
    if user.role == UserRole.BUYER and user.buyer_profile:
        business_name = user.buyer_profile.company_name
    elif user.role == UserRole.FPO and user.fpo_profile:
        business_name = user.fpo_profile.fpo_name

    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
            "role": user.role,
            "location": user.location,
            "businessName": business_name,
            "is_verified": user.is_verified
        }
    }

@router.post("/refresh")
def refresh_access_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        data = decode_token(payload.refresh_token, is_refresh=True)
        user_id = data.get("sub")
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="Invalid refresh token session")

        access_token = create_access_token({"sub": str(user.id), "role": user.role, "name": user.name})
        new_refresh = create_refresh_token({"sub": str(user.id)})
        user.refresh_token = new_refresh
        db.commit()

        return {
            "access_token": access_token,
            "refresh_token": new_refresh,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Refresh token expired or invalid: {str(e)}")

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    business_name = None
    fpo_reg_no = None
    if current_user.role == UserRole.BUYER and current_user.buyer_profile:
        business_name = current_user.buyer_profile.company_name
    elif current_user.role == UserRole.FPO and current_user.fpo_profile:
        business_name = current_user.fpo_profile.fpo_name
        fpo_reg_no = current_user.fpo_profile.registration_no

    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "phone": current_user.phone,
        "email": current_user.email,
        "role": current_user.role,
        "location": current_user.location,
        "businessName": business_name,
        "fpoRegNo": fpo_reg_no,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.strftime("%Y-%m-%d")
    }

@router.post("/logout")
def logout_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.refresh_token = None
    db.commit()
    return {"success": True, "message": "Successfully logged out"}

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.phone == payload.identifier) | (User.email == payload.identifier)
    ).first()
    if not user:
        return {"success": True, "message": "If an account exists, OTP/reset link has been dispatched."}
    
    reset_token = create_access_token({"sub": str(user.id), "scope": "reset_pwd"})
    return {
        "success": True,
        "message": "Password reset token dispatched successfully",
        "reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        data = decode_token(payload.token)
        user_id = data.get("sub")
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.password_hash = hash_password(payload.new_password)
        db.commit()
        return {"success": True, "message": "Password reset successfully. Please log in with your new password."}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
