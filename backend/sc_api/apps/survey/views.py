import re

from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from sc_api.apps.schema.models import Respondent, Survey, SurveyResponse
from sc_api.apps.survey.serializers import (
    SurveyCreateUpdateSerializer,
    SurveyDetailSerializer,
    SurveyListSerializer,
    SurveyPublicSerializer,
)
from sc_api.apps.utils.email import send_survey_emails


class SurveyListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            queryset = (
                Survey.objects.filter(team=request.user.team)
                .select_related("created_by", "team")
                .annotate(total_responses=Count("responses"))
                .order_by("-created_at")
            )

            serializer = SurveyListSerializer(queryset, many=True)

            return Response(
                {
                    "success": True,
                    "data": {
                        "surveys": serializer.data,
                    },
                }
            )

        except Exception as e:
            return Response(
                {"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        try:
            serializer = SurveyCreateUpdateSerializer(data=request.data)

            if serializer.is_valid():
                survey = serializer.save(created_by=request.user, team=request.user.team)
                detail_serializer = SurveyDetailSerializer(survey)

                return Response(
                    {
                        "success": True,
                        "message": "Survey created successfully.",
                        "data": detail_serializer.data,
                    },
                    status=status.HTTP_201_CREATED,
                )

            return Response(
                {"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SurveyDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, oid, user):
        return get_object_or_404(
            Survey.objects.select_related("created_by", "team").annotate(
                total_responses=Count("responses")
            ),
            oid=oid,
            team=user.team,
        )

    def get(self, request, oid):
        try:
            survey = self.get_object(oid, request.user)
            serializer = SurveyDetailSerializer(survey)

            return Response({"success": True, "data": serializer.data})

        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, oid):
        try:
            survey = get_object_or_404(Survey, oid=oid, team=request.user.team)

            if survey.status == "published" and survey.response_count > 0:
                return Response(
                    {"success": False, "error": "Cannot delete published survey with responses."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            survey_title = survey.title
            survey.delete()

            return Response(
                {"success": True, "message": f'Survey "{survey_title}" deleted successfully.'},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SurveyPublishView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, oid):
        try:
            survey = get_object_or_404(Survey, oid=oid, team=request.user.team)
            action = request.data.get("action")

            if action == "publish":
                if not survey.questions:
                    return Response(
                        {
                            "success": False,
                            "error": "Survey must have at least one question to publish.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                survey.status = "published"
                message = "Survey published successfully."

            elif action == "unpublish":
                survey.status = "draft"
                message = "Survey unpublished successfully."

            else:
                return Response(
                    {"success": False, "error": 'Invalid action. Use "publish" or "unpublish".'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            survey.save()
            serializer = SurveyDetailSerializer(survey)

            return Response({"success": True, "message": message, "data": serializer.data})

        except Exception as e:
            return Response(
                {"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SurveyPublicView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, oid):
        """Get public survey for filling out (no authentication required)"""
        try:
            survey = get_object_or_404(Survey.objects.filter(status="published"), oid=oid)

            if not survey.is_active:
                return Response(
                    {"success": False, "error": "This survey is not currently active."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = SurveyPublicSerializer(survey)
            return Response({"success": True, "data": serializer.data})

        except Exception:
            return Response(
                {"success": False, "error": "Survey not found or not available."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def post(self, request, oid):
        """Submit survey response (no authentication required)"""
        try:
            survey = get_object_or_404(Survey.objects.filter(status="published"), oid=oid)

            if not survey.is_active:
                return Response(
                    {"success": False, "error": "This survey is not currently active."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get response data
            responses = request.data.get("responses", {})
            respondent_info = request.data.get("respondent_info", {})

            print(f"Received responses: {responses}")  # Debug log
            print(f"Received respondent_info: {respondent_info}")  # Debug log

            # Validate required data
            if not respondent_info:
                return Response(
                    {"success": False, "error": "Respondent information is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate required respondent info
            required_fields = ["full_name", "email", "phone"]
            for field in required_fields:
                if not respondent_info.get(field):
                    return Response(
                        {
                            "success": False,
                            "error": f"{field.replace('_', ' ').title()} is required.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Validate email format
            email_pattern = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
            if not email_pattern.match(respondent_info.get("email", "")):
                return Response(
                    {"success": False, "error": "Please provide a valid email address."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get or create respondent
            respondent, created = Respondent.objects.get_or_create(
                email=respondent_info.get("email"),
                defaults={
                    "full_name": respondent_info.get("full_name"),
                    "phone_number": respondent_info.get("phone"),  # Note: phone_number not phone
                },
            )

            # Update respondent info if it already exists but info is different
            if not created:
                updated = False
                if respondent.full_name != respondent_info.get("full_name"):
                    respondent.full_name = respondent_info.get("full_name")
                    updated = True
                if respondent.phone_number != respondent_info.get("phone"):
                    respondent.phone_number = respondent_info.get("phone")
                    updated = True
                if updated:
                    respondent.save()

            print(f"Respondent: {respondent} (created: {created})")  # Debug log

            # Create survey response record
            survey_response = SurveyResponse.objects.create(
                survey=survey,
                respondent=respondent,
                answers=responses,  # Use 'answers' not 'responses'
                is_complete=True,
            )

            print(f"Survey response created: {survey_response.oid}")  # Debug log
            print(f"Answers stored: {survey_response.answers}")  # Debug log

            return Response(
                {
                    "success": True,
                    "message": "Thank you for your response!",
                    "data": {
                        "response_id": survey_response.oid,
                        "survey_title": survey.title,
                        "submitted_at": survey_response.created_at,
                        "completed_at": survey_response.completed_at,
                        "answers_count": len(responses),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            print(f"Error in survey submission: {str(e)}")  # Debug log
            import traceback

            traceback.print_exc()  # Debug log
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SurveySendInvitesView(APIView):
    """Send survey invitations via email."""

    permission_classes = [IsAuthenticated]

    def post(self, request, oid):
        try:
            survey = get_object_or_404(Survey, oid=oid, team=request.user.team)

            # Extract data
            data = request.data
            emails = data.get("emails", [])
            survey_url = data.get("survey_url")
            custom_message = data.get("custom_message", "")

            # Validate inputs
            if not emails or not isinstance(emails, list):
                return Response(
                    {"success": False, "error": "Email list is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not survey_url:
                return Response(
                    {"success": False, "error": "Survey URL is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Send emails using utility function
            result = send_survey_emails(
                survey=survey,
                emails=emails,
                survey_url=survey_url,
                custom_message=custom_message,
                sender=request.user,
            )

            if not result["success"]:
                return Response(
                    {"success": False, "error": result["error"]}, status=status.HTTP_400_BAD_REQUEST
                )

            success_message = f"Successfully sent {result['sent_count']} survey invitations"
            if result.get("failed_emails"):
                success_message += f" ({len(result['failed_emails'])} failed)"

            return Response(
                {"success": True, "message": success_message, "data": result},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
