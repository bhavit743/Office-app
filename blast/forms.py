from django import forms
from django_select2.forms import ModelSelect2MultipleWidget
from ckeditor.widgets import CKEditorWidget
from .models import EmailCampaign, WhatsAppCampaign, Group, Client

class GroupSelectWidget(ModelSelect2MultipleWidget):
    search_fields = ["name__icontains"]

class ClientSelectWidget(ModelSelect2MultipleWidget):
    search_fields = ["name__icontains", "email__icontains", "phone__icontains", "company__icontains"]

class EmailCampaignForm(forms.ModelForm):
    body_html = forms.CharField(widget=CKEditorWidget())
    class Meta:
        model = EmailCampaign
        fields = ["name","subject","body_html","from_email","recipient_mode","groups","selected_clients","scheduled_at"]
        widgets = {
            "groups": GroupSelectWidget(model=Group),
            "selected_clients": ClientSelectWidget(model=Client),
        }

class WhatsAppCampaignForm(forms.ModelForm):
    class Meta:
        model = WhatsAppCampaign
        fields = ["name","message_text","recipient_mode","groups","selected_clients","scheduled_at"]
        widgets = {
            "groups": GroupSelectWidget(model=Group),
            "selected_clients": ClientSelectWidget(model=Client),
        }

class UploadFileForm(forms.Form):
    file = forms.FileField(help_text="CSV or Excel (.xlsx/.xls)")