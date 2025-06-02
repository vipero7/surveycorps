import logging

from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

logger = logging.getLogger(__name__)


class CustomAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            logger.info("Checking for access token in cookie")
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"]) or None
        else:
            logger.info("Checking for access token in header")
            raw_token = self.get_raw_token(header)
        logger.debug("Raw access token retrieved")
        if raw_token is None:
            logger.error("Access Token not provided!!")
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            logger.debug("Token validated")
        except InvalidToken:
            raise InvalidToken(
                {
                    "message": "Your session has expired. Please login!!",
                }
            )

        user = self.get_user(validated_token)
        logger.debug(f"Currently logged in user oid: {user.oid}")
        return user, validated_token
