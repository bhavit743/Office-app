import csv
from .models import Client

def import_clients(file, user=None):
    """
    Reads a CSV file and creates Client objects.
    Expects columns: name, email, phone
    """
    decoded_file = file.read().decode("utf-8").splitlines()
    reader = csv.DictReader(decoded_file)
    count = 0

    for row in reader:
        name = row.get("name") or row.get("Name")
        email = row.get("email") or row.get("Email")
        phone = row.get("phone") or row.get("Phone")

        if not email:
            continue  # skip invalid rows

        # Avoid duplicates by email
        if not Client.objects.filter(email=email).exists():
            Client.objects.create(
                name=name or "",
                email=email,
                phone=phone or "",
                owner=user if user else None
            )
            count += 1

    return count
