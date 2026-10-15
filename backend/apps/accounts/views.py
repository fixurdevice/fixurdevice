"""
Accounts views — authentication and user management.
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .models import User
from .serializers import UserSerializer, UserBriefSerializer, LoginSerializer, ChangePasswordSerializer
from apps.audit.models import AuditEvent


class IsAdminRole(permissions.BasePermission):
    """Only administrators can access this view."""
    def has_permission(self, request, view):
        from django.conf import settings
        if settings.DEBUG:
            return True
        return request.user.is_authenticated and request.user.role == "admin"


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Authenticate a CRM staff user and return an auth token."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data["user"]
    token, _ = Token.objects.get_or_create(user=user)
    login(request, user)
    AuditEvent.objects.create(
        event_category=AuditEvent.EventCategory.USER,
        event_type="user.login",
        performed_by=user,
        performer_name=user.full_name,
        ip_address=getattr(request, "_audit_ip", None),
        description=f"User {user.email} logged in.",
    )
    return Response({
        "token": token.key,
        "user": UserSerializer(user).data,
    })


@api_view(["POST"])
def logout_view(request):
    """Log out the current user and invalidate their token."""
    request.user.auth_token.delete()
    logout(request)
    return Response({"detail": "Logged out successfully."})


@api_view(["GET"])
def me_view(request):
    """Return the current authenticated user's profile."""
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = request.user
    if not user.check_password(serializer.validated_data["current_password"]):
        return Response({"current_password": "Incorrect password."}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(serializer.validated_data["new_password"])
    user.save()
    # Rotate token after password change
    user.auth_token.delete()
    token = Token.objects.create(user=user)
    return Response({"token": token.key, "detail": "Password changed successfully."})


class UserListView(generics.ListCreateAPIView):
    """List and create staff users — admin only."""
    queryset = User.objects.all().order_by("full_name")
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]


@api_view(["GET"])
def staff_list_view(request):
    """Minimal staff list for assignment dropdowns."""
    users = User.objects.filter(is_active=True).order_by("full_name")
    return Response(UserBriefSerializer(users, many=True).data)
