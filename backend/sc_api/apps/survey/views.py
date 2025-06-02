import re

from django.conf import settings
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
from sc_api.apps.utils.email import (
    send_submission_confirmation_email,
    send_survey_emails,
)


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
        try:
            survey = get_object_or_404(Survey.objects.filter(status="published"), oid=oid)

            if not survey.is_active:
                return Response(
                    {"success": False, "error": "This survey is not currently active."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            responses = request.data.get("responses", {})
            respondent_info = request.data.get("respondent_info", {})

            if not respondent_info:
                return Response(
                    {"success": False, "error": "Respondent information is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

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

            email_pattern = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
            if not email_pattern.match(respondent_info.get("email", "")):
                return Response(
                    {"success": False, "error": "Please provide a valid email address."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            respondent, created = Respondent.objects.get_or_create(
                email=respondent_info.get("email"),
                defaults={
                    "full_name": respondent_info.get("full_name"),
                    "phone_number": respondent_info.get("phone"),
                },
            )

            existing_response = SurveyResponse.objects.filter(
                survey=survey, respondent=respondent, is_complete=True
            ).first()

            if existing_response:
                view_submission_url = (
                    f"{settings.FRONTEND_BASE_URL}/survey/submission/{existing_response.oid}/view"
                )
                return Response(
                    {
                        "success": False,
                        "error": "You have already submitted a response to this survey.",
                        "data": {
                            "already_submitted": True,
                            "response_id": existing_response.oid,
                            "view_submission_url": view_submission_url,
                            "submitted_at": existing_response.created_at,
                        },
                    },
                    status=status.HTTP_409_CONFLICT,
                )

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

            survey_response = SurveyResponse.objects.create(
                survey=survey,
                respondent=respondent,
                answers=responses,
                is_complete=True,
            )

            view_submission_url = (
                f"{settings.FRONTEND_BASE_URL}/survey/submission/{survey_response.oid}/view"
            )

            try:
                email_result = send_submission_confirmation_email(
                    survey_response=survey_response, view_submission_url=view_submission_url
                )

                if email_result["success"]:
                    print(
                        f"Confirmation email sent successfully to {survey_response.respondent.email}"
                    )
                else:
                    print(f"Failed to send confirmation email: {email_result['error']}")

            except Exception as email_error:
                print(f"Error sending confirmation email: {str(email_error)}")

            return Response(
                {
                    "success": True,
                    "message": "Thank you for your response! A confirmation email has been sent to you.",
                    "data": {
                        "response_id": survey_response.oid,
                        "survey_title": survey.title,
                        "submitted_at": survey_response.created_at,
                        "completed_at": survey_response.completed_at,
                        "answers_count": len(responses),
                        "view_submission_url": view_submission_url,
                        "email_sent": (
                            email_result.get("success", False)
                            if "email_result" in locals()
                            else False
                        ),
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            print(f"Error in survey submission: {str(e)}")
            import traceback

            traceback.print_exc()
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SurveySendInvitesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, oid):
        try:
            survey = get_object_or_404(Survey, oid=oid, team=request.user.team)

            data = request.data
            emails = data.get("emails", [])
            survey_url = data.get("survey_url")
            custom_message = data.get("custom_message", "")

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


class SurveySubmissionView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, response_oid):
        try:
            survey_response = get_object_or_404(
                SurveyResponse.objects.select_related("survey", "respondent"), oid=response_oid
            )

            survey = survey_response.survey

            response_data = {
                "response_id": survey_response.oid,
                "survey": {
                    "title": survey.title,
                    "description": survey.description,
                    "questions": survey.questions,
                },
                "respondent": {
                    "full_name": survey_response.respondent.full_name,
                    "email": survey_response.respondent.email,
                    "phone": survey_response.respondent.phone_number,
                },
                "answers": survey_response.answers,
                "submitted_at": survey_response.created_at,
                "completed_at": survey_response.completed_at,
                "is_complete": survey_response.is_complete,
            }

            return Response({"success": True, "data": response_data})

        except Exception:
            return Response(
                {"success": False, "error": "Submission not found or not available."},
                status=status.HTTP_404_NOT_FOUND,
            )


class SurveySubmissionCheckView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, oid):
        try:
            survey = get_object_or_404(Survey.objects.filter(status="published"), oid=oid)
            email = request.data.get("email")

            if not email:
                return Response({"success": True, "data": {"has_submitted": False}})

            try:
                respondent = Respondent.objects.get(email=email)
                existing_response = SurveyResponse.objects.filter(
                    survey=survey, respondent=respondent, is_complete=True
                ).first()

                if existing_response:
                    view_url = f"{settings.FRONTEND_BASE_URL}/survey/submission/{existing_response.oid}/view"
                    return Response(
                        {
                            "success": True,
                            "data": {
                                "has_submitted": True,
                                "response_id": existing_response.oid,
                                "view_submission_url": view_url,
                                "submitted_at": existing_response.created_at,
                            },
                        }
                    )

            except Respondent.DoesNotExist:
                pass

            return Response({"success": True, "data": {"has_submitted": False}})

        except Exception as e:
            return Response(
                {"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
