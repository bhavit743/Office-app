import os
from typing import Tuple
from twilio.rest import Client as TwilioClient

def send_whatsapp_message(to_phone: str, body: str) -> Tuple[bool, int, str]:
    """Twilio WhatsApp example. Replace with Meta Cloud API if desired."""
    try:
        account_sid = os.environ.get("TWILIO_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        from_whatsapp = os.environ.get("TWILIO_WA_FROM")  # e.g. 'whatsapp:+14155238886'
        client = TwilioClient(account_sid, auth_token)
        msg = client.messages.create(
            body=body,
            from_=from_whatsapp,
            to=f"whatsapp:{to_phone}"
        )
        return True, 200, msg.sid
    except Exception as e:
        return False, 500, str(e)