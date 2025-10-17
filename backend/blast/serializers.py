from rest_framework import serializers
from .models import Client, Group

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"

class GroupSerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Client.objects.all()
    )
    class Meta:
        model = Group
        fields = "__all__"
