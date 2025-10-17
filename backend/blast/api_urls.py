from rest_framework.routers import DefaultRouter
from .api_views import ClientViewSet, GroupViewSet
from django.urls import path, include
from .views import send_email, upload_csv

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path("", include(router.urls)),
    path("send-email/", send_email, name="send-email"),
    path("upload_csv/", upload_csv, name="upload_csv"),
]