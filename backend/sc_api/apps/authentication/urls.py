from django.urls import path
from sc_api.apps.authentication.views import (
    LoginView,
)

app_name = "auth"
urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
]
