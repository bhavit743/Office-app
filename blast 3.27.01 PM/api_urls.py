from rest_framework.routers import DefaultRouter
from .api_views import ClientViewSet, GroupViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = router.urls
