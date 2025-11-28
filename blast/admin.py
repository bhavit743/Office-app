from django.contrib import admin
from .models import Client, Group, EmailCampaign, WhatsAppCampaign, SendLog

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "company", "city")
    search_fields = ("name", "email", "phone", "company", "city")
    list_filter = ("city",)

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    search_fields = ("name",)

@admin.register(EmailCampaign)
class EmailCampaignAdmin(admin.ModelAdmin):
    list_display = ("name", "subject", "status", "created_at", "sent_at")

@admin.register(WhatsAppCampaign)
class WhatsAppCampaignAdmin(admin.ModelAdmin):
    list_display = ("name", "status", "created_at", "sent_at")

@admin.register(SendLog)
class SendLogAdmin(admin.ModelAdmin):
    list_display = ("channel", "campaign_name", "client", "success", "created_at")
    list_filter = ("channel", "success")