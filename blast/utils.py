import pandas as pd
from .models import Client

REQUIRED_COLUMNS = ["name"]
COLUMN_MAP = {
    "Name": "name",
    "Email": "email",
    "Phone": "phone",
    "Company": "company",
    "City": "city",
    "Tags": "tags",
}

def normalize_columns(df):
    return df.rename(columns={k: v for k, v in COLUMN_MAP.items() if k in df.columns})

def import_clients_from_file(uploaded_file):
    name = uploaded_file.name.lower()
    if name.endswith(".csv"):
        df = pd.read_csv(uploaded_file)
    else:
        df = pd.read_excel(uploaded_file)
    df = normalize_columns(df)

    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    count = 0
    errors = []
    for _, row in df.iterrows():
        try:
            tags = row.get("tags")
            if isinstance(tags, str) and tags.strip():
                tags_val = [t.strip() for t in tags.split(",")]
            elif isinstance(tags, list):
                tags_val = tags
            else:
                tags_val = []
            Client.objects.update_or_create(
                email=row.get("email") or None,
                phone=row.get("phone") or None,
                defaults={
                    "name": row.get("name") or "Unknown",
                    "company": row.get("company") or "",
                    "city": row.get("city") or "",
                    "tags": tags_val,
                },
            )
            count += 1
        except Exception as e:
            errors.append(str(e))
    return count, errors