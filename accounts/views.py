from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import (
    urlsafe_base64_decode,
    urlsafe_base64_encode,
)

from .models import User
from .serializers import (
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = serializer.save()

            token, _ = Token.objects.get_or_create(
                user=user
            )

            return Response(
                {
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {
                    "detail": "Username and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(
            request=request,
            username=username,
            password=password,
        )

        if user is None:
            return Response(
                {
                    "detail": "Invalid username or password."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )
        
class CoordinatorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.NGO_ADMIN:
            return Response(
                {
                    "detail": (
                        "Only NGO administrators "
                        "can view coordinators."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        coordinators = User.objects.filter(
            role=User.Role.COORDINATOR,
            is_active=True,
        ).order_by("username")

        return Response(
            UserSerializer(
                coordinators,
                many=True,
            ).data,
            status=status.HTTP_200_OK,
        )
        
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data["email"]

        users = User.objects.filter(
            email__iexact=email,
            is_active=True,
        )

        for user in users:
            uid = urlsafe_base64_encode(
                force_bytes(user.pk)
            )

            token = default_token_generator.make_token(
                user
            )

            reset_link = (
                f"{settings.FRONTEND_URL}"
                f"/reset-password/{uid}/{token}"
            )

            send_mail(
                subject="Reset your password",
                message=(
                    "You requested a password reset.\n\n"
                    f"Reset your password here:\n"
                    f"{reset_link}\n\n"
                    "If you did not request this, "
                    "you can ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )

        return Response(
            {
                "detail": (
                    "If an account exists with that email, "
                    "a password reset link has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )
        
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(
        self,
        request,
        uidb64,
        token,
    ):
        try:
            user_id = force_str(
                urlsafe_base64_decode(uidb64)
            )

            user = User.objects.get(
                pk=user_id
            )

        except (
            TypeError,
            ValueError,
            OverflowError,
            UnicodeDecodeError,
            User.DoesNotExist,
        ):
            return Response(
                {
                    "detail": (
                        "Invalid password reset link."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(
            user,
            token,
        ):
            return Response(
                {
                    "detail": (
                        "Invalid or expired password "
                        "reset link."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = PasswordResetConfirmSerializer(
            data=request.data,
            context={"user": user},
        )

        serializer.is_valid(
            raise_exception=True
        )

        user.set_password(
            serializer.validated_data[
                "new_password"
            ]
        )

        user.save(
            update_fields=["password"]
        )

        Token.objects.filter(
            user=user
        ).delete()

        return Response(
            {
                "detail": (
                    "Password reset successfully. "
                    "Please log in again."
                )
            },
            status=status.HTTP_200_OK,
        )