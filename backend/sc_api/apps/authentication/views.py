import logging

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from sc_api.apps.authentication.serializers import (
    LoginSerializer,
)
from sc_api.apps.utils.decorators import (
    params_required,
)

logger = logging.getLogger(__name__)


class LoginView(GenericAPIView):
    authentication_classes = []
    permission_classes = [
        AllowAny,
    ]
    serializer_class = LoginSerializer
    queryset = get_user_model().objects.none()

    @params_required(params=("email", "password"))
    def post(self, request, *args, **kwargs):
        logger.info("Starting post method of LoginView")
        try:
            email = request.data["email"]
            password = request.data["password"]

            logger.info("Authenticating")
            self.user = authenticate(request, email=email, password=password)
            if not self.user:
                return Response(
                    {"message": "Invalid email or password"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            response = self.get_response(email)
            logger.info("Updating last login")
            self.user.last_login = timezone.now()
            self.user.save()
            logger.info("Saving user login history")
            return response
        except get_user_model().DoesNotExist:
            return Response(
                {"message": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception:
            logger.error("Unable to login", exc_info=True)
            return Response(
                {"message": "Unable to log user in!!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_tokens_for_user(self):
        refresh = RefreshToken.for_user(self.user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": self.user.get_full_name() or self.user.email,
        }

    def get_response(self, email):
        logger.info("Starting get_response method")
        if self.user is None:
            logger.error("Unable to authenticate email!!")
            logger.error("Email does not exist in our system!!")
            raise get_user_model().DoesNotExist

        logger.info("Successfully authenticated")
        logger.info("Checking if email is inactive in our system")
        if not self.user.is_active:
            logger.error("Inactive account trying to log in!!")
            raise get_user_model().DoesNotExist

        try:
            logger.info("User found to be active in our system")
            logger.info("Initializing response object for user")
            response = Response()

            logger.info("Getting tokens for user")
            tokens = self.get_tokens_for_user()
            logger.info("Successfully created tokens for user")

            logger.info("Setting cookie")
            response.set_cookie(
                key=settings.SIMPLE_JWT["REFRESH_COOKIE"],
                value=tokens["refresh"],
                expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            )
            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_COOKIE"],
                value=tokens["access"],
                expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            )
            logger.info("Successfully set cookie")
            response.data = {"message": "Logged in successfully", "data": tokens}
            return response
        except Exception as e:
            logger.error("Error while generating response")
            raise e
