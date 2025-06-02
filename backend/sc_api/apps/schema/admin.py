from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

from .models import Respondent, Survey, SurveyResponse, Team, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "last_name", "team", "role", "is_active", "is_staff")
    list_filter = ("is_active", "is_staff", "role", "team")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    filter_horizontal = ()

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "team", "role")}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Important dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "password1",
                    "password2",
                    "first_name",
                    "last_name",
                    "team",
                    "role",
                ),
            },
        ),
    )


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "survey_count", "member_count", "created_at")
    search_fields = ("name",)
    ordering = ("name",)

    def survey_count(self, obj):
        return obj.survey_set.count()

    survey_count.short_description = "Surveys"

    def member_count(self, obj):
        return obj.user_set.count()

    member_count.short_description = "Members"


@admin.register(Respondent)
class RespondentAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "email",
        "phone_number",
        "response_count",
        "created_at",
    )
    list_filter = ("created_at",)
    search_fields = ("email", "full_name", "phone_number")
    ordering = ("full_name",)

    def response_count(self, obj):
        return obj.surveyresponse_set.count()

    response_count.short_description = "Responses"


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "created_by",
        "team",
        "status",
        "response_count",
        "allow_multiple_responses",
        "is_active",
        "created_at",
    )
    list_filter = ("status", "allow_multiple_responses", "team", "created_at")
    search_fields = ("title", "description", "created_by__email")
    ordering = ("-created_at",)
    readonly_fields = (
        "oid",
        "public_url_link",
        "edit_url_link",
        "responses_url_link",
        "response_count",
    )

    fieldsets = (
        ("Basic Information", {"fields": ("title", "description", "created_by", "team")}),
        ("Settings", {"fields": ("status", "allow_multiple_responses")}),
        ("Schedule", {"fields": ("start_date", "end_date"), "classes": ("collapse",)}),
        ("Content", {"fields": ("questions", "configs"), "classes": ("collapse",)}),
        (
            "URLs & Statistics",
            {
                "fields": (
                    "oid",
                    "public_url_link",
                    "edit_url_link",
                    "responses_url_link",
                    "response_count",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    def public_url_link(self, obj):
        if obj.oid:
            url = obj.public_url
            return format_html('<a href="{}" target="_blank">{}</a>', url, url)
        return "-"

    public_url_link.short_description = "Public URL"

    def edit_url_link(self, obj):
        if obj.oid:
            url = obj.edit_url
            return format_html('<a href="{}" target="_blank">{}</a>', url, url)
        return "-"

    edit_url_link.short_description = "Edit URL"

    def responses_url_link(self, obj):
        if obj.oid:
            url = obj.responses_url
            return format_html('<a href="{}" target="_blank">{}</a>', url, url)
        return "-"

    responses_url_link.short_description = "Responses URL"


@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = (
        "survey",
        "respondent_name",
        "respondent_email",
        "is_complete",
        "completed_at",
        "response_url_link",
        "created_at",
    )
    list_filter = ("is_complete", "survey", "completed_at", "created_at")
    search_fields = (
        "survey__title",
        "respondent__email",
        "respondent__first_name",
        "respondent__last_name",
    )
    ordering = ("-created_at",)
    readonly_fields = ("oid", "response_url_link", "completed_at")

    fieldsets = (
        (
            "Response Information",
            {"fields": ("survey", "respondent", "is_complete", "completed_at")},
        ),
        ("Content", {"fields": ("answers",)}),
        ("System", {"fields": ("oid", "response_url_link"), "classes": ("collapse",)}),
    )

    def respondent_name(self, obj):
        return f"{obj.respondent.first_name} {obj.respondent.last_name}".strip()

    respondent_name.short_description = "Name"

    def respondent_email(self, obj):
        return obj.respondent.email

    respondent_email.short_description = "Email"

    def response_url_link(self, obj):
        if obj.oid:
            url = obj.response_url
            return format_html('<a href="{}" target="_blank">{}</a>', url, url)
        return "-"

    response_url_link.short_description = "Response URL"
