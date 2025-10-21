from django.urls import path
from . import views

urlpatterns = [
    path("contacts/", views.contacts_page, name="contacts"),
    path("groups/", views.group_page, name="groups"),
    path("upload/", views.upload_contacts, name="upload_contacts"),
    path("images/upload/", views.upload_image, name='ckeditor-image-upload')
]
