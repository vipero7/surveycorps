from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from sc_api.apps.schema.abstract_models import GlobalAbstractModel
from sc_api.apps.schema.choices import ROLE_CHOICES


class User(AbstractUser, GlobalAbstractModel):
    """User model with email as the authentication field."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_role = self.role

    username = None
    date_joined = None
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.TextField(blank=True)
    last_name = models.TextField(blank=True)
    password_archive = models.JSONField(default=list)
    team = models.ForeignKey("Team", on_delete=models.CASCADE, null=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default=ROLE_CHOICES[0][0])
    login_count = models.IntegerField(default=0)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "user"
        ordering = ("first_name", "last_name", "email")

    def __str__(self):
        return self.email


class Team(GlobalAbstractModel):
    """Team model"""

    name = models.CharField(max_length=255, unique=True)
    display_name = models.CharField(max_length=255)
    config = models.JSONField(default=dict)
