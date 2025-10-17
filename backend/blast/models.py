from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class TimeStamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Client(TimeStamped):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=128, blank=True)

    def __str__(self):
        return f"{self.name} ({self.email or self.phone})"

class Group(TimeStamped):

    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    members = models.ManyToManyField(Client, related_name="client_groups", blank=True)

    def __str__(self):
        return self.name
