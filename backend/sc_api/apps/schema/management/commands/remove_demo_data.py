import json
import os

from django.conf import settings
from django.core.management.base import BaseCommand
from sc_api.apps.schema.models import Respondent, Survey, SurveyResponse, Team, User


class Command(BaseCommand):
    help = "Remove demo data created by load_demo_data command"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force deletion without confirmation",
        )

    def handle(self, *args, **options):
        demo_dir = os.path.join(settings.RESOURCES_DIR, "demo_data")

        if not os.path.exists(demo_dir):
            self.stdout.write(self.style.ERROR(f"Demo data directory not found: {demo_dir}"))
            return

        try:
            team_file = os.path.join(demo_dir, "team.json")
            user_file = os.path.join(demo_dir, "user.json")
            respondent_file = os.path.join(demo_dir, "respondent.json")
            survey_file = os.path.join(demo_dir, "survey.json")

            with open(team_file, "r") as f:
                team_data = json.load(f)

            with open(user_file, "r") as f:
                user_data = json.load(f)

            with open(respondent_file, "r") as f:
                respondents_data = json.load(f)

            with open(survey_file, "r") as f:
                surveys_data = json.load(f)

            self.stdout.write(self.style.WARNING("\nThe following demo data will be DELETED:"))

            team_name = team_data["name"]
            user_email = user_data["email"]
            respondent_emails = [r["email"] for r in respondents_data]
            survey_titles = [s["title"] for s in surveys_data]

            team_count = Team.objects.filter(name=team_name).count()
            user_count = User.objects.filter(email=user_email).count()
            respondent_count = Respondent.objects.filter(email__in=respondent_emails).count()
            survey_count = Survey.objects.filter(title__in=survey_titles).count()
            response_count = SurveyResponse.objects.filter(survey__title__in=survey_titles).count()

            self.stdout.write(f"  📁 Team: {team_name} ({team_count} record)")
            self.stdout.write(f"  👤 User: {user_email} ({user_count} record)")
            self.stdout.write(f"  🧑‍🤝‍🧑 Respondents: {respondent_count} records")
            self.stdout.write(f"  📋 Surveys: {survey_count} records")
            self.stdout.write(f"  📝 Survey Responses: {response_count} records")

            total_records = (
                team_count + user_count + respondent_count + survey_count + response_count
            )

            if total_records == 0:
                self.stdout.write(self.style.SUCCESS("✓ No demo data found to delete."))
                return

            if not options["force"]:
                confirmation = input(
                    f"\nAre you sure you want to delete {total_records} records? (yes/no): "
                )
                if confirmation.lower() not in ["yes", "y"]:
                    self.stdout.write(self.style.WARNING("Deletion cancelled."))
                    return

            deleted_counts = {}

            deleted_counts["responses"] = SurveyResponse.objects.filter(
                survey__title__in=survey_titles
            ).delete()[0]

            deleted_counts["surveys"] = Survey.objects.filter(title__in=survey_titles).delete()[0]

            deleted_counts["respondents"] = Respondent.objects.filter(
                email__in=respondent_emails
            ).delete()[0]

            deleted_counts["users"] = User.objects.filter(email=user_email).delete()[0]

            deleted_counts["teams"] = Team.objects.filter(name=team_name).delete()[0]

            self.stdout.write(
                self.style.SUCCESS(
                    f"\n   Demo data deleted successfully!"
                    f'\n   Teams: {deleted_counts["teams"]}'
                    f'\n   Users: {deleted_counts["users"]}'
                    f'\n   Respondents: {deleted_counts["respondents"]}'
                    f'\n   Surveys: {deleted_counts["surveys"]}'
                    f'\n   Responses: {deleted_counts["responses"]}'
                )
            )

        except FileNotFoundError as e:
            self.stdout.write(self.style.ERROR(f"File not found: {e}"))
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f"Invalid JSON format: {e}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error removing demo data: {e}"))
