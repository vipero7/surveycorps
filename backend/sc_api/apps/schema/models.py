from django.contrib.auth.models import AbstractUser
from django.core.validators import EmailValidator
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from sc_api.apps.schema.abstract_models import GlobalAbstractModel
from sc_api.apps.schema.choices import (
    ROLE_CHOICES,
    SURVEY_CATEGORY_CHOICES,
    SURVEY_STATUS_CHOICES,
)
from sc_api.apps.schema.managers import UserManager


class Respondent(GlobalAbstractModel):
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    phone_number = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)

    class Meta:
        db_table = "respondent"
        verbose_name_plural = "Respondents"
        ordering = ["full_name", "email"]

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class Survey(GlobalAbstractModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=SURVEY_CATEGORY_CHOICES, default="other")
    created_by = models.ForeignKey("User", on_delete=models.CASCADE, related_name="created_surveys")
    team = models.ForeignKey("Team", on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=20, choices=SURVEY_STATUS_CHOICES, default="published")
    allow_multiple_responses = models.BooleanField(default=False)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    questions = models.JSONField(default=list)
    configs = models.JSONField(default=dict)

    class Meta:
        db_table = "survey"
        verbose_name_plural = "Surveys"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def response_count(self):
        return self.responses.count()

    @property
    def is_active(self):
        if self.status != "published":
            return False
        now = timezone.now()
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        return True

    @property
    def public_url(self):
        return f"/surveys/{self.oid}/"

    @property
    def edit_url(self):
        return f"/surveys/{self.oid}/edit/"

    @property
    def responses_url(self):
        return f"/surveys/{self.oid}/responses/"


class SurveyResponse(GlobalAbstractModel):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name="responses")
    respondent = models.ForeignKey(Respondent, on_delete=models.CASCADE)
    answers = models.JSONField(default=dict)
    is_complete = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "survey_response"
        verbose_name_plural = "Survey Responses"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if self.is_complete and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.survey.title} - {self.respondent.full_name}"

    @property
    def response_url(self):
        return f"/surveys/{self.survey.oid}/response/{self.oid}/"


class Team(GlobalAbstractModel):
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = "team"
        verbose_name_plural = "Teams"

    def __str__(self):
        return self.name


class User(AbstractUser, GlobalAbstractModel):
    username = None
    date_joined = None
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default=ROLE_CHOICES[0][0])

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        db_table = "user"
        ordering = ("first_name", "last_name", "email")

    def __str__(self):
        return self.email
