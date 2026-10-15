"""
Custom User model with role-based access control.
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class UserRole(models.TextChoices):
    ADMIN = "admin", "Administrator"
    CRM_EXECUTIVE = "crm_executive", "CRM Executive / Customer Support"
    PICKUP_EXECUTIVE = "pickup_executive", "Pickup / Delivery Executive"
    TECHNICIAN = "technician", "Technician / Repair Engineer"
    FINANCE = "finance", "Finance / Accounts"
    MANAGER = "manager", "Read-only Manager"


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", UserRole.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model with role-based access control."""

    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=30, choices=UserRole.choices, default=UserRole.CRM_EXECUTIVE)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    profile_photo = models.ImageField(upload_to="staff/photos/", null=True, blank=True)

    # Notification preferences
    notify_new_lead = models.BooleanField(default=True)
    notify_lead_assigned = models.BooleanField(default=True)
    notify_overdue_followup = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        db_table = "accounts_user"
        verbose_name = "Staff User"
        verbose_name_plural = "Staff Users"
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN

    @property
    def is_crm_executive(self):
        return self.role == UserRole.CRM_EXECUTIVE

    @property
    def is_pickup_executive(self):
        return self.role == UserRole.PICKUP_EXECUTIVE

    @property
    def is_technician(self):
        return self.role == UserRole.TECHNICIAN

    @property
    def is_finance(self):
        return self.role == UserRole.FINANCE

    @property
    def is_manager(self):
        return self.role == UserRole.MANAGER

    def has_financial_access(self):
        return self.role in [UserRole.ADMIN, UserRole.FINANCE]

    def has_crm_access(self):
        return self.role in [UserRole.ADMIN, UserRole.CRM_EXECUTIVE, UserRole.MANAGER]

    def can_manage_repairs(self):
        return self.role in [UserRole.ADMIN, UserRole.TECHNICIAN]
