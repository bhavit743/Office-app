from django.contrib import admin
from .models import Client, Group

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "owner")
    search_fields = ("name", "email", "phone")

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("name", "owner")
    search_fields = ("name",)
    filter_horizontal = ("members",)