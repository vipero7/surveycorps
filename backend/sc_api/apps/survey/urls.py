from django.urls import path
from sc_api.apps.survey.views import (
    SurveyDetailView,
    SurveyListCreateView,
    SurveyPublicView,
    SurveyPublishView,
    SurveySendInvitesView,
    SurveySubmissionCheckView,
    SurveySubmissionView,
)

app_name = "survey"
urlpatterns = [
    path("", SurveyListCreateView.as_view(), name="survey_list_create"),
    path("<str:oid>/", SurveyDetailView.as_view(), name="survey_detail"),
    path("<str:oid>/publish/", SurveyPublishView.as_view(), name="survey_publish"),
    path("<str:oid>/get-public/", SurveyPublicView.as_view(), name="survey_public"),
    path("<str:oid>/send-invites/", SurveySendInvitesView.as_view(), name="survey_send_invites"),
    path(
        "<str:oid>/check-submission/", SurveySubmissionCheckView.as_view(), name="check_submission"
    ),
    path(
        "submission/<str:response_oid>/get/",
        SurveySubmissionView.as_view(),
        name="submission_view",
    ),
]
