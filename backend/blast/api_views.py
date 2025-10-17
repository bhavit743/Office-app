from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Client, Group
from .serializers import ClientSerializer, GroupSerializer
from .utils import import_clients

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser])
    def upload(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided"}, status=400)
        count = import_clients(file)   
        return Response({"message": f"{count} clients uploaded successfully!"})
