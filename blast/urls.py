from django.urls import path
from . import views

app_name = "blast"

urlpatterns = [
    path("email/", views.email_campaign_create, name="email_campaign_create"),
    path("whatsapp/", views.whatsapp_campaign_create, name="whatsapp_campaign_create"),
    path("contacts/", views.contacts, name="contacts"),
    path("contacts/upload/", views.upload_contacts, name="upload_contacts"),
    path("groups/", views.groups, name="groups"),
]