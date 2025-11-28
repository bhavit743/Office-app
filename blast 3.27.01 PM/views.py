from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import ClientForm, GroupForm, UploadFileForm
from .models import Client, Group
from .utils import import_clients

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
