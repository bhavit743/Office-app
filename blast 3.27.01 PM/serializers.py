from rest_framework import serializers
from .models import Client, Group

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ["id", "name", "email", "phone", "company", "city"]

class GroupSerializer(serializers.ModelSerializer):
    members = ClientSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "description", "members"]
