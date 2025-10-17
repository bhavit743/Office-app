from django import forms
from .models import Client, Group

class ClientForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ["name", "email", "phone", "company", "city"]

class GroupForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ["name", "description", "members"]

class UploadFileForm(forms.Form):
    file = forms.FileField(help_text="Upload Excel/CSV")
