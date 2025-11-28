from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator

User = get_user_model()

class TimeStamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class Client(TimeStamped):
    name = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True, db_index=True)
    phone = models.CharField(
        max_length=20, null=True, blank=True, db_index=True,
        validators=[RegexValidator(r"^[0-9+\-()\s]+$", "Invalid phone number format")]
    )
    company = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=128, blank=True)
    tags = models.JSONField(default=list, blank=True)
    def __str__(self):
        return self.name

class Group(TimeStamped):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    members = models.ManyToManyField(Client, related_name="groups", blank=True)
    def __str__(self):
        return self.name

class RecipientMode(models.TextChoices):
    ALL = "ALL", "All Clients"
    GROUPS = "GROUPS", "Groups"
    SELECTED = "SELECTED", "Selected Clients"

class CampaignBase(TimeStamped):
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=200)
    recipient_mode = models.CharField(max_length=10, choices=RecipientMode.choices, default=RecipientMode.ALL)
    groups = models.ManyToManyField(Group, blank=True)
    selected_clients = models.ManyToManyField(Client, blank=True)

    class Meta:
        abstract = True

    def resolve_recipients(self):
        if self.recipient_mode == RecipientMode.ALL:
            return Client.objects.all()
        elif self.recipient_mode == RecipientMode.GROUPS:
            return Client.objects.filter(groups__in=self.groups.all()).distinct()
        else:
            return self.selected_clients.all()

class EmailCampaign(CampaignBase):
    subject = models.CharField(max_length=255)
    body_html = models.TextField()
    from_email = models.EmailField(blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default="draft")

class WhatsAppCampaign(CampaignBase):
    message_text = models.TextField()
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default="draft")

class SendLog(TimeStamped):
    channel = models.CharField(max_length=10, choices=(("EMAIL", "EMAIL"), ("WA", "WA"),))
    campaign_name = models.CharField(max_length=200)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    success = models.BooleanField(default=False)
    response_code = models.CharField(max_length=50, blank=True)
    response_body = models.TextField(blank=True)