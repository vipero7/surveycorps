import logging
import re

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def validate_emails(emails):
    """Validate a list of email addresses."""
    email_pattern = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    valid_emails = []
    invalid_emails = []

    for email in emails:
        email = email.strip()
        if email and email_pattern.match(email):
            valid_emails.append(email)
        elif email:  # Not empty but invalid
            invalid_emails.append(email)

    return valid_emails, invalid_emails


def send_survey_emails(survey, emails, survey_url, custom_message="", sender=None):
    """
    Send survey invitation emails to a list of recipients.

    Args:
        survey: Survey instance
        emails: List of email addresses
        survey_url: URL to the survey
        custom_message: Optional custom message to include
        sender: User sending the emails

    Returns:
        dict: Results of email sending operation
    """
    logger.info(f"Starting to send emails for survey: {survey.title}")
    logger.info(f"Email settings - Backend: {settings.EMAIL_BACKEND}")
    logger.info(f"Email settings - Host: {getattr(settings, 'EMAIL_HOST', 'Not set')}")
    logger.info(f"Email settings - Port: {getattr(settings, 'EMAIL_PORT', 'Not set')}")
    logger.info(f"Email settings - TLS: {getattr(settings, 'EMAIL_USE_TLS', 'Not set')}")
    logger.info(f"Email settings - User: {getattr(settings, 'EMAIL_HOST_USER', 'Not set')}")
    logger.info(f"Email settings - From: {settings.DEFAULT_FROM_EMAIL}")
    logger.info(f"Total emails to process: {len(emails)}")

    # Validate emails
    valid_emails, invalid_emails = validate_emails(emails)
    logger.info(f"Valid emails: {valid_emails}")
    logger.info(f"Invalid emails: {invalid_emails}")

    if not valid_emails:
        logger.warning("No valid email addresses provided")
        return {
            "success": False,
            "error": "No valid email addresses provided",
            "invalid_emails": invalid_emails,
        }

    # Create email content
    subject = f"You're invited to participate in: {survey.title}"

    body = f"""Hello,

You are invited to collaborate in a survey: "{survey.title}"

{survey.description if survey.description else ''}

{custom_message if custom_message else ''}

Please click the link below to participate:
{survey_url}

Thank you for your participation!

Best regards,
{sender.get_full_name() or sender.email if sender else 'Survey Team'}
{sender.team.name if sender and sender.team else ''}
"""

    logger.info(f"Email subject: {subject}")
    logger.info(f"Email body length: {len(body)} characters")

    # Send emails
    sent_count = 0
    failed_emails = []

    for email in valid_emails:
        try:
            logger.info(f"Attempting to send email to: {email}")

            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

            sent_count += 1
            logger.info(f"Successfully sent email to: {email}")

        except Exception as e:
            error_message = str(e)
            logger.error(f"Failed to send email to {email}: {error_message}")
            failed_emails.append({"email": email, "error": error_message})

    logger.info(f"Email sending complete. Sent: {sent_count}, Failed: {len(failed_emails)}")

    # Prepare results
    result = {
        "success": True,
        "sent_count": sent_count,
        "total_attempted": len(valid_emails),
        "survey_title": survey.title,
    }

    if invalid_emails:
        result["invalid_emails"] = invalid_emails
        logger.info(f"Invalid emails found: {invalid_emails}")

    if failed_emails:
        result["failed_emails"] = failed_emails
        logger.error(f"Failed emails: {failed_emails}")

    logger.info(f"Final result: {result}")
    return result


def test_email_connection():
    """
    Test email connection and settings.
    Call this function to verify email configuration.
    """
    logger.info("Testing email connection...")

    try:
        from django.core.mail import get_connection

        connection = get_connection()
        connection.open()
        logger.info("Email connection successful!")
        connection.close()
        return True

    except Exception as e:
        logger.error(f"Email connection failed: {str(e)}")
        return False


def send_test_email(to_email):
    """
    Send a test email to verify email functionality.

    Args:
        to_email: Email address to send test email to

    Returns:
        dict: Result of test email
    """
    logger.info(f"Sending test email to: {to_email}")

    try:
        send_mail(
            subject="Test Email from Survey Platform",
            message="This is a test email to verify email functionality is working correctly.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )

        logger.info(f"Test email sent successfully to: {to_email}")
        return {"success": True, "message": f"Test email sent successfully to {to_email}"}

    except Exception as e:
        error_message = str(e)
        logger.error(f"Test email failed: {error_message}")
        return {"success": False, "error": error_message}


def send_submission_confirmation_email(survey_response, view_submission_url):
    """
    Send confirmation email to respondent with link to view their submission.

    Args:
        survey_response: SurveyResponse instance
        view_submission_url: URL where user can view their submitted data

    Returns:
        dict: Result of email sending operation
    """
    logger.info(f"Sending submission confirmation email for response: {survey_response.oid}")

    respondent = survey_response.respondent
    survey = survey_response.survey

    # Create email content
    subject = f"Thank you for completing: {survey.title}"

    body = f"""Hello {respondent.full_name},

Thank you for completing the survey: "{survey.title}"

Your responses have been successfully submitted on {survey_response.created_at.strftime('%B %d, %Y at %I:%M %p')}.

You can view your submitted responses at any time by clicking the link below:
{view_submission_url}

Response ID: {survey_response.oid}
Survey: {survey.title}
Submitted: {survey_response.created_at.strftime('%B %d, %Y at %I:%M %p')}

If you have any questions about this survey, please contact the survey administrator.

Best regards,
Survey Team
"""

    logger.info(f"Sending confirmation email to: {respondent.email}")

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[respondent.email],
            fail_silently=False,
        )

        logger.info(f"Confirmation email sent successfully to: {respondent.email}")
        return {
            "success": True,
            "message": f"Confirmation email sent to {respondent.email}",
            "recipient": respondent.email,
        }

    except Exception as e:
        error_message = str(e)
        logger.error(f"Failed to send confirmation email to {respondent.email}: {error_message}")
        return {"success": False, "error": error_message, "recipient": respondent.email}
