from django.urls import path
from sc_api.apps.survey.views import (
    SurveyDetailView,
    SurveyListCreateView,
    SurveyPublicView,
    SurveyPublishView,
    SurveySendInvitesView,
)

app_name = "survey"

urlpatterns = [
    path("", SurveyListCreateView.as_view(), name="survey_list_create"),
    path("<str:oid>/", SurveyDetailView.as_view(), name="survey_detail"),
    path("<str:oid>/publish/", SurveyPublishView.as_view(), name="survey_publish"),
    path("<str:oid>/fill/", SurveyPublicView.as_view(), name="survey_fill"),
    path("<str:oid>/send-invites/", SurveySendInvitesView.as_view(), name="survey_send_invites"),
]
