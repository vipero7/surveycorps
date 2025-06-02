import logging

from django.contrib.auth import get_user_model
from rest_framework import serializers

logger = logging.getLogger(__name__)


class LoginSerializer(serializers.ModelSerializer):
    email = serializers.CharField(style={"input_type": "email", "placeholder": "Email"})
    password = serializers.CharField(
        write_only=True, style={"input_type": "password", "placeholder": "Password"}
    )

    class Meta:
        model = get_user_model()
        fields = ["email", "password"]
