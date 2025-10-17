from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import ClientForm, GroupForm, UploadFileForm
from .models import Client, Group
from .utils import import_clients
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from datetime import datetime

@login_required
def contacts_page(request):
    clients = Client.objects.filter(owner=request.user)
    groups = Group.objects.filter(owner=request.user)

    if request.method == "POST" and "add_client" in request.POST:
        form = ClientForm(request.POST)
        if form.is_valid():
            client = form.save(commit=False)
            client.owner = request.user
            client.save()
            messages.success(request, "Client added successfully!")
            return redirect("contacts")
    else:
        form = ClientForm()

    return render(request, "blast/contacts.html", {
        "clients": clients,
        "groups": groups,
        "form": form
    })

@login_required
def group_page(request):
    if request.method == "POST":
        form = GroupForm(request.POST)
        if form.is_valid():
            group = form.save(commit=False)
            group.owner = request.user
            group.save()
            form.save_m2m()
            messages.success(request, "Group created!")
            return redirect("groups")
    else:
        form = GroupForm()

    groups = Group.objects.filter(owner=request.user)
    return render(request, "blast/groups.html", {"form": form, "groups": groups})

@login_required
def upload_contacts(request):
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            count = import_clients(request.FILES["file"], request.user)
            messages.success(request, f"{count} clients uploaded successfully!")
            return redirect("contacts")
    else:
        form = UploadFileForm()
    return render(request, "blast/upload.html", {"form": form})

@api_view(["POST"])
def send_email(request):
    mode = request.data.get("mode")
    clients = request.data.get("clients", [])
    group_id = request.data.get("group")
    body = request.data.get("body", "")
    subject = request.data.get("subject", "📩 New Update from Us")
    preview = request.data.get("preview", False)

    # figure out recipients
    recipients = []
    if mode == "all":
        recipients = list(Client.objects.values_list("email", flat=True))
    elif mode == "selected":
        recipients = list(Client.objects.filter(id__in=clients).values_list("email", flat=True))
    elif mode == "groups" and group_id:
        group = Group.objects.get(id=group_id)
        recipients = list(group.members.values_list("email", flat=True))
    elif mode == "single":
        # here `clients` will contain one recipient email
        recipients = clients
    elif mode == "batch":
            # ✅ batch mode already gives full list of emails
        recipients = request.data.get("clients", [])

    if preview:
        return Response({"recipients": recipients})

    # render the body into base template
    html_content = render_to_string("base_email.html", {
        "body": body,
        "year": datetime.now().year,
    })

    for recipient in recipients:
        msg = EmailMultiAlternatives(
            subject=subject,
            body="This is an HTML email",  # plain fallback
            from_email="bhavitgupta743@gmail.com",
            to=[recipient],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()

    return Response({"status": "ok", "sent": len(recipients)})