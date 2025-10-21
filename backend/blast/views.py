from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from datetime import datetime
from rest_framework.decorators import api_view, action, permission_classes,parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser,FormParser
import csv
from django.http import HttpResponse
from io import TextIOWrapper

from .forms import ClientForm, GroupForm, UploadFileForm
from .models import Client, Group
from .utils import import_clients # new CSV helper
from django.core.files.storage import default_storage
from django.conf import settings

# --------------------------
#  CONTACTS PAGE (WEB VIEW)
# --------------------------
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
            messages.success(request, "✅ Client added successfully!")
            return redirect("contacts")
    else:
        form = ClientForm()

    return render(request, "blast/contacts.html", {
        "clients": clients,
        "groups": groups,
        "form": form
    })


# --------------------------
#  GROUPS PAGE (WEB VIEW)
# --------------------------
@login_required
def group_page(request):
    if request.method == "POST":
        form = GroupForm(request.POST)
        if form.is_valid():
            group = form.save(commit=False)
            group.owner = request.user
            group.save()
            form.save_m2m()
            messages.success(request, "✅ Group created successfully!")
            return redirect("groups")
    else:
        form = GroupForm()

    groups = Group.objects.filter(owner=request.user)
    return render(request, "blast/groups.html", {"form": form, "groups": groups})


# --------------------------
#  UPLOAD CONTACTS PAGE (FORM)
# --------------------------
@login_required
def upload_contacts(request):
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            count = import_clients(request.FILES["file"], request.user)
            messages.success(request, f"✅ {count} clients uploaded successfully!")
            return redirect("contacts")
    else:
        form = UploadFileForm()
    return render(request, "blast/upload.html", {"form": form})





# --------------------------
#  API: SEND EMAIL
# --------------------------
@api_view(["POST"])
def send_email(request):
    mode = request.data.get("mode")
    clients = request.data.get("clients", [])
    group_id = request.data.get("group")
    body = request.data.get("body", "")
    subject = request.data.get("subject", "📩 New Update from Us")
    preview = request.data.get("preview", False)

    # Determine recipients
    recipients = []
    if mode == "all":
        recipients = list(Client.objects.values_list("email", flat=True))
    elif mode == "selected":
        recipients = list(Client.objects.filter(id__in=clients).values_list("email", flat=True))
    elif mode == "groups" and group_id:
        group = Group.objects.get(id=group_id)
        recipients = list(group.members.values_list("email", flat=True))
    elif mode == "single":
        recipients = clients  # single email passed directly
    elif mode == "batch":
        recipients = clients  # list of email strings from frontend

    if preview:
        return Response({"recipients": recipients})

    if not recipients:
        return Response({"error": "No recipients found"}, status=status.HTTP_400_BAD_REQUEST)

    success_count = 0
    failed = []

    # render email using HTML template
    html_content = render_to_string("base_email.html", {
        "body": body,
        "year": datetime.now().year,
    })

    # send emails
    for recipient in recipients:
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body="This email requires HTML support.",
                to=[recipient],
            )
            msg.attach_alternative(html_content, "text/html")
            print("worked")
            msg.send(fail_silently=False)
            success_count += 1
        except Exception as e:
            print(f"ERROR sending email to {recipient}: {e}")
            failed.append({"email": recipient, "error": str(e)})

    return Response({
        "status": "done",
        "sent": success_count,
        "failed": failed,
        "total": len(recipients),
    })

# --------------------------
#  API: CSV UPLOAD ENDPOINT
# --------------------------
@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_csv(request):
    """
    Handles contact uploads from CSV files.
    Expected columns: name, email, phone
    """
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    try:
        decoded_file = TextIOWrapper(file.file, encoding="utf-8")
        reader = csv.DictReader(decoded_file)
    except Exception as e:
        return Response({"error": f"Invalid CSV file: {str(e)}"}, status=400)

    count = 0
    for row in reader:
        email = row.get("email")
        if not email:
            continue

        Client.objects.get_or_create(
            email=email.strip(),
            defaults={
                "name": row.get("name") or "",
                "phone": row.get("phone") or "",
            },
        )
        count += 1

    return Response({"message": f"{count} clients uploaded successfully!"})

#download template

def download_template(request):
    """
    Generates and returns a CSV template for uploading clients.
    """
    # Create the HttpResponse object with CSV headers
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="client_upload_template.csv"'

    writer = csv.writer(response)
    writer.writerow(["name", "email", "phone"])  # CSV header row
    writer.writerow(["John Doe", "john@example.com", "9876543210"])  # Example row

    return response


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser]) # Handle file uploads
def upload_image(request):
    """
    Handles image uploads from the CKEditor.
    Expects the file in a form field named 'upload'.
    Returns the URL of the saved image.
    """
    file_obj = request.FILES.get('upload') # 'upload' is the default field name CKEditor uses
    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

    # Basic validation (optional but recommended)
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext not in allowed_extensions:
        return Response({'error': 'Invalid file type.'}, status=status.HTTP_400_BAD_REQUEST)
    if file_obj.size > 5 * 1024 * 1024: # Limit file size (e.g., 5MB)
         return Response({'error': 'File size exceeds limit (5MB).'}, status=status.HTTP_400_BAD_REQUEST)

    # Save the file using Django's default storage
    file_name = default_storage.save(file_obj.name, file_obj)

    # Construct the absolute URL
    # Use settings.MEDIA_URL which includes the leading/trailing slashes
    file_url = request.build_absolute_uri(settings.MEDIA_URL + file_name)

    # Return the URL in the format CKEditor expects
    return Response({'url': file_url}, status=status.HTTP_201_CREATED)