from django.urls import path
from .views import job_list
from .views import job_list, locations_list

urlpatterns = [
    path("jobs/", job_list),
    path("locations/", locations_list),
]
