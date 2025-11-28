from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from .models import EmailCampaign, WhatsAppCampaign, SendLog
from .wa import send_whatsapp_message

@shared_task
def queue_email_campaign(campaign_id):
    campaign = EmailCampaign.objects.get(id=campaign_id)
    recipients = campaign.resolve_recipients()
    sent_ok = 0
    for client in recipients.iterator():
        if not client.email:
            continue
        try:
            msg = EmailMultiAlternatives(
                subject=campaign.subject,
                body="",
                from_email=campaign.from_email or None,
                to=[client.email],
            )
            msg.attach_alternative(campaign.body_html, "text/html")
            msg.send()
            SendLog.objects.create(channel="EMAIL", campaign_name=campaign.name, client=client, success=True)
            sent_ok += 1
        except Exception as e:
            SendLog.objects.create(channel="EMAIL", campaign_name=campaign.name, client=client, success=False, response_body=str(e))
    campaign.sent_at = timezone.now()
    campaign.status = "done"
    campaign.save(update_fields=["sent_at","status"])
    return sent_ok

@shared_task
def queue_whatsapp_campaign(campaign_id):
    campaign = WhatsAppCampaign.objects.get(id=campaign_id)
    recipients = campaign.resolve_recipients()
    sent_ok = 0
    for client in recipients.iterator():
        if not client.phone:
            continue
        ok, code, resp = send_whatsapp_message(client.phone, campaign.message_text)
        SendLog.objects.create(channel="WA", campaign_name=campaign.name, client=client, success=ok, response_code=str(code), response_body=str(resp))
        if ok:
            sent_ok += 1
    campaign.sent_at = timezone.now()
    campaign.status = "done"
    campaign.save(update_fields=["sent_at","status"])
    return sent_ok