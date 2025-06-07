from django.utils import timezone
from rest_framework import serializers
from sc_api.apps.schema.models import Survey


class SurveyListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    team_name = serializers.CharField(source="team.name", read_only=True)
    total_responses = serializers.IntegerField(read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Survey
        fields = [
            "oid",
            "title",
            "description",
            "category",
            "category_display",
            "status",
            "status_display",
            "created_by_name",
            "team_name",
            "total_responses",
            "is_active",
            "public_url",
            "created_at",
            "updated_at",
        ]


class SurveyDetailSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    team_name = serializers.CharField(source="team.name", read_only=True)
    total_responses = serializers.IntegerField(read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Survey
        fields = [
            "oid",
            "title",
            "description",
            "category",
            "category_display",
            "status",
            "status_display",
            "allow_multiple_responses",
            "start_date",
            "end_date",
            "questions",
            "configs",
            "created_by",
            "created_by_name",
            "team",
            "team_name",
            "total_responses",
            "is_active",
            "public_url",
            "edit_url",
            "responses_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["oid", "created_by", "created_at", "updated_at"]


class SurveyCreateUpdateSerializer(serializers.ModelSerializer):
    start_date = serializers.DateTimeField(required=False, allow_null=True)
    end_date = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Survey
        fields = [
            "title",
            "description",
            "category",
            "status",
            "allow_multiple_responses",
            "start_date",
            "end_date",
            "questions",
            "configs",
        ]

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Survey title is required.")
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Survey title must be at least 3 characters long.")
        return value.strip()

    def validate_questions(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Questions must be a list.")

        if len(value) == 0:
            raise serializers.ValidationError("At least one question is required.")

        for i, question in enumerate(value, 1):
            if not isinstance(question, dict):
                raise serializers.ValidationError(f"Question {i} must be an object.")

            if "question" not in question or not question["question"].strip():
                raise serializers.ValidationError(f"Question {i} must have a title.")

            if "type" not in question:
                raise serializers.ValidationError(f"Question {i} must have a type.")

            valid_types = [
                "text",
                "textarea",
                "number",
                "email",
                "phone",
                "date",
                "radio",
                "checkbox",
                "dropdown",
                "rating",
            ]
            if question["type"] not in valid_types:
                raise serializers.ValidationError(f"Question {i} has invalid type.")

            if question["type"] in ["radio", "checkbox", "dropdown"]:
                if "options" not in question or not question["options"]:
                    raise serializers.ValidationError(f"Question {i} must have options.")

                if not isinstance(question["options"], list) or len(question["options"]) < 1:
                    raise serializers.ValidationError(
                        f"Question {i} must have at least one option."
                    )

                for j, option in enumerate(question["options"]):
                    if not option or not str(option).strip():
                        raise serializers.ValidationError(
                            f"Question {i}, option {j + 1} cannot be empty."
                        )

        return value

    def validate_start_date(self, value):
        if value:
            if timezone.is_naive(value):
                value = timezone.make_aware(value)
        return value

    def validate_end_date(self, value):
        if value:
            if timezone.is_naive(value):
                value = timezone.make_aware(value)
        return value

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        if start_date and end_date:
            if timezone.is_naive(start_date):
                start_date = timezone.make_aware(start_date)
            if timezone.is_naive(end_date):
                end_date = timezone.make_aware(end_date)

            if start_date >= end_date:
                raise serializers.ValidationError("Start date must be before end date.")

        return attrs


class SurveyPublicSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Survey
        fields = [
            "oid",
            "title",
            "description",
            "category_display",
            "allow_multiple_responses",
            "questions",
            "is_active",
        ]
