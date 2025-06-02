from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("sc_api.apps.authentication.urls")),
    path("survey/", include("sc_api.apps.survey.urls")),
]
