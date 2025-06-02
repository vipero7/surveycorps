import json
import os

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from sc_api.apps.schema.models import Respondent, Survey, SurveyResponse, Team, User


class Command(BaseCommand):
    help = "Load demo data from JSON files"

    def handle(self, *args, **options):
        demo_dir = os.path.join(settings.RESOURCES_DIR, "demo_data")

        if not os.path.exists(demo_dir):
            self.stdout.write(self.style.ERROR(f"Demo data directory not found: {demo_dir}"))
            return

        try:
            team_file = os.path.join(demo_dir, "team.json")
            with open(team_file, "r") as f:
                team_data = json.load(f)

            team, created = Team.objects.get_or_create(name=team_data["name"], defaults=team_data)

            if created:
                self.stdout.write(self.style.SUCCESS(f"✓ Created team: {team.name}"))
            else:
                self.stdout.write(self.style.WARNING(f"! Team already exists: {team.name}"))

            user_file = os.path.join(demo_dir, "user.json")
            with open(user_file, "r") as f:
                user_data = json.load(f)

            if User.objects.filter(email=user_data["email"]).exists():
                self.stdout.write(
                    self.style.WARNING(f'! User already exists: {user_data["email"]}')
                )
                user = User.objects.get(email=user_data["email"])
            else:
                user_data["password"] = make_password("test@123")
                user_data["team"] = team

                user = User.objects.create(**user_data)
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Created user: {user.email} with team: {team.name}")
                )

            respondent_file = os.path.join(demo_dir, "respondent.json")
            with open(respondent_file, "r") as f:
                respondents_data = json.load(f)

            respondents = []
            for respondent_data in respondents_data:
                respondent, created = Respondent.objects.get_or_create(
                    email=respondent_data["email"], defaults=respondent_data
                )
                respondents.append(respondent)

                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f"✓ Created respondent: {respondent.full_name}")
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f"! Respondent already exists: {respondent.full_name}")
                    )

            survey_file = os.path.join(demo_dir, "survey.json")
            with open(survey_file, "r") as f:
                surveys_data = json.load(f)

            surveys = []
            for survey_data in surveys_data:
                if Survey.objects.filter(title=survey_data["title"]).exists():
                    self.stdout.write(
                        self.style.WARNING(f'! Survey already exists: {survey_data["title"]}')
                    )
                    survey = Survey.objects.get(title=survey_data["title"])
                else:
                    survey_data["created_by"] = user
                    survey_data["team"] = team
                    survey = Survey.objects.create(**survey_data)
                    self.stdout.write(self.style.SUCCESS(f"✓ Created survey: {survey.title}"))
                surveys.append(survey)

            response_file = os.path.join(demo_dir, "survey_response.json")
            with open(response_file, "r") as f:
                responses_data = json.load(f)

            response_mappings = [
                (0, 0, 0),
                (1, 0, 1),
                (2, 1, 2),
            ]

            responses_created = 0
            for i, (response_idx, survey_idx, respondent_idx) in enumerate(response_mappings):
                if (
                    response_idx < len(responses_data)
                    and survey_idx < len(surveys)
                    and respondent_idx < len(respondents)
                ):
                    response_data = responses_data[response_idx].copy()

                    if SurveyResponse.objects.filter(
                        survey=surveys[survey_idx], respondent=respondents[respondent_idx]
                    ).exists():
                        self.stdout.write(
                            self.style.WARNING(
                                f"! Response already exists for {surveys[survey_idx].title} by {respondents[respondent_idx].full_name}"
                            )
                        )
                        continue

                    response_data["survey"] = surveys[survey_idx]
                    response_data["respondent"] = respondents[respondent_idx]
                    SurveyResponse.objects.create(**response_data)
                    responses_created += 1

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Created response for {surveys[survey_idx].title} by {respondents[respondent_idx].full_name}"
                        )
                    )

            # Summary
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n   Demo data loaded successfully!"
                    f"\n   Team: {team.name}"
                    f"\n   User: {user.email} (password: test@123)"
                    f"\n   Respondents: {len(respondents)}"
                    f"\n   Surveys: {len(surveys)}"
                    f"\n   Responses: {responses_created}"
                )
            )

        except FileNotFoundError as e:
            self.stdout.write(self.style.ERROR(f"File not found: {e}"))
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f"Invalid JSON format: {e}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error loading demo data: {e}"))
