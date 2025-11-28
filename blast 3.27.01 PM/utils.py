import pandas as pd
from .models import Client

def import_clients(file, owner):
    if file.name.endswith(".csv"):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)

    count = 0
    for _, row in df.iterrows():
        Client.objects.get_or_create(
            owner=owner,
            name=row.get("Name", "Unknown"),
            email=row.get("Email"),
            phone=row.get("Phone"),
            company=row.get("Company", ""),
            city=row.get("City", "")
        )
        count += 1
    return count
