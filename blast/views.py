from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from .forms import EmailCampaignForm, WhatsAppCampaignForm, UploadFileForm
from .models import Client, Group
from .tasks import queue_email_campaign, queue_whatsapp_campaign
from .utils import import_clients_from_file

@login_required
def email_campaign_create(request):
    if request.method == "POST":
        form = EmailCampaignForm(request.POST)
        if form.is_valid():
            campaign = form.save(commit=False)
            campaign.owner = request.user
            campaign.status = "queued"
            campaign.save()
            form.save_m2m()
            queue_email_campaign.delay(campaign.id)
            messages.success(request, "Email campaign queued!")
            return redirect("blast:email_campaign_create")
    else:
        form = EmailCampaignForm()
    return render(request, "blast/email_campaign_form.html", {"form": form})

@login_required
def whatsapp_campaign_create(request):
    if request.method == "POST":
        form = WhatsAppCampaignForm(request.POST)
        if form.is_valid():
            campaign = form.save(commit=False)
            campaign.owner = request.user
            campaign.status = "queued"
            campaign.save()
            form.save_m2m()
            queue_whatsapp_campaign.delay(campaign.id)
            messages.success(request, "WhatsApp campaign queued!")
            return redirect("blast:whatsapp_campaign_create")
    else:
        form = WhatsAppCampaignForm()
    return render(request, "blast/whatsapp_campaign_form.html", {"form": form})

@login_required
def contacts(request):
    qs = Client.objects.all().order_by("-created_at")
    return render(request, "blast/contacts.html", {"clients": qs[:200]})

@login_required
def groups(request):
    return render(request, "blast/groups.html", {"groups": Group.objects.prefetch_related("members")})

@login_required
def upload_contacts(request):
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            count, errors = import_clients_from_file(request.FILES["file"])
            if errors:
                messages.warning(request, f"Imported {count} clients with {len(errors)} warnings.")
            else:
                messages.success(request, f"Imported {count} clients.")
            return redirect("blast:contacts")
    else:
        form = UploadFileForm()
    return render(request, "blast/upload_contacts.html", {"form": form})