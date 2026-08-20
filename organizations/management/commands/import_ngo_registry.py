import csv
from datetime import datetime

from django.core.management.base import BaseCommand

from organizations.models import VerifiedNGORegistry


class Command(BaseCommand):
    help = "Import verified NGO registry records from a CSV file."

    def add_arguments(self, parser):
        parser.add_argument(
            "csv_file",
            type=str,
            help="Path to the NGO registry CSV file",
        )

    def parse_date(self, value):
        value = (value or "").strip()

        if not value:
            return None

        return datetime.strptime(
            value,
            "%Y-%m-%d",
        ).date()

    def handle(self, *args, **options):
        csv_file = options["csv_file"]

        created_count = 0
        updated_count = 0
        skipped_count = 0

        with open(
            csv_file,
            newline="",
            encoding="utf-8-sig",
        ) as file:
            reader = csv.DictReader(file)

            for row in reader:
                registration_number = (
                    row["registration_number"].strip()
                )

                if not registration_number:
                    skipped_count += 1
                    continue

                ngo, created = (
                    VerifiedNGORegistry.objects.update_or_create(
                        registration_number=registration_number,
                        defaults={
                            "name": row["name"].strip(),
                            "address": row["address"].strip(),
                            "registration_date": self.parse_date(
                                row["registration_date"]
                            ),
                            "renewed_on": self.parse_date(
                                row["renewed_on"]
                            ),
                            "valid_upto": self.parse_date(
                                row["valid_upto"]
                            ),
                            "district": row["district"].strip(),
                            "country": (
                                row["country"].strip()
                                or "Bangladesh"
                            ),
                            "remarks": row["remarks"].strip(),
                            "source_name": row[
                                "source_name"
                            ].strip(),
                        },
                    )
                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                (
                    f"Import complete. "
                    f"Created: {created_count}, "
                    f"Updated: {updated_count}, "
                    f"Skipped: {skipped_count}"
                )
            )
        )