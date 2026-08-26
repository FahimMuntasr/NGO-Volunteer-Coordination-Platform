from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from donations.models import Donation
from events.models import Event, Registration
from organizations.models import NGO
from volunteering.models import Skill, VolunteerProfile


User = get_user_model()


class Command(BaseCommand):
    help = "Create demo data for project presentation."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.WARNING(
                "Creating demo data..."
            )
        )

        now = timezone.now()

        # =========================================
        # 1. CREATE SKILLS
        # =========================================

        skill_names = [
            "First Aid",
            "Photography",
            "Event Management",
            "Teaching",
            "Fundraising",
            "Social Media",
            "Cleaning",
            "Swimming",
            "Food Distribution",
            "Public Speaking",
        ]

        skills = {}

        for name in skill_names:
            skill, _ = Skill.objects.get_or_create(
                name=name
            )

            skills[name] = skill

        self.stdout.write(
            self.style.SUCCESS(
                "Skills created."
            )
        )

        # =========================================
        # 2. HELPER FOR USERS
        # =========================================

        def create_user(
            username,
            role,
            first_name,
            last_name,
            email,
        ):
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    "role": role,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                },
            )

            # Make sure existing demo users
            # also have the correct information.
            user.role = role
            user.first_name = first_name
            user.last_name = last_name
            user.email = email

            # All demo accounts use the
            # same password.
            user.set_password(
                "DemoPass123!"
            )

            user.save()

            return user

        # =========================================
        # 3. CREATE NGO ADMIN
        # =========================================

        ngo_admin = create_user(
            username="DemoNGOAdmin",
            role=User.Role.NGO_ADMIN,
            first_name="Demo",
            last_name="Administrator",
            email="demoadmin@example.com",
        )

        # =========================================
        # 4. CREATE COORDINATOR
        # =========================================

        coordinator = create_user(
            username="DemoCoordinator",
            role=User.Role.COORDINATOR,
            first_name="Demo",
            last_name="Coordinator",
            email="coordinator@example.com",
        )

        # =========================================
        # 5. CREATE DONOR
        # =========================================

        donor = create_user(
            username="DemoDonor",
            role=User.Role.DONOR,
            first_name="Demo",
            last_name="Donor",
            email="donor@example.com",
        )

        # =========================================
        # 6. CREATE VOLUNTEERS
        # =========================================

        volunteer_users = []

        volunteer_data = [
            (
                "DemoVolunteer",
                "Demo",
                "Volunteer",
                "volunteer@example.com",
            ),
            (
                "DemoVolunteer2",
                "Sara",
                "Ahmed",
                "sara@example.com",
            ),
            (
                "DemoVolunteer3",
                "Nabil",
                "Rahman",
                "nabil@example.com",
            ),
            (
                "DemoVolunteer4",
                "Ayesha",
                "Khan",
                "ayesha@example.com",
            ),
        ]

        for (
            username,
            first_name,
            last_name,
            email,
        ) in volunteer_data:

            user = create_user(
                username=username,
                role=User.Role.VOLUNTEER,
                first_name=first_name,
                last_name=last_name,
                email=email,
            )

            volunteer_users.append(user)

        # =========================================
        # 7. CREATE VOLUNTEER PROFILES
        # =========================================

        volunteer_profiles = []

        for index, user in enumerate(
            volunteer_users
        ):
            profile, _ = (
                VolunteerProfile.objects
                .get_or_create(
                    user=user
                )
            )

            profile.availability_notes = (
                "Available weekends and evenings."
            )

            profile.save()

            volunteer_profiles.append(
                profile
            )

        volunteer_profiles[0].skills.set(
            [
                skills["First Aid"],
                skills["Photography"],
                skills["Event Management"],
            ]
        )

        volunteer_profiles[1].skills.set(
            [
                skills["Teaching"],
                skills["Social Media"],
            ]
        )

        volunteer_profiles[2].skills.set(
            [
                skills["Food Distribution"],
                skills["Fundraising"],
            ]
        )

        volunteer_profiles[3].skills.set(
            [
                skills["Public Speaking"],
                skills["First Aid"],
            ]
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Demo users created."
            )
        )

        # =========================================
        # 8. CREATE VERIFIED DEMO NGO
        # =========================================

        ngo, _ = NGO.objects.update_or_create(
            name="Demo Helping Hands NGO",
            administrator=ngo_admin,
            defaults={
                "address": (
                    "Dhaka, Bangladesh"
                ),
                "email": (
                    "demo@helpinghands.org"
                ),
                "description": (
                    "Demo NGO used for the "
                    "CSE327 project presentation."
                ),
                "registration_number": (
                    "DEMO-001"
                ),
                "is_verified": True,
                "verification_status": (
                    NGO.VerificationStatus.VERIFIED
                ),
                "verified_at": now,
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Demo NGO created."
            )
        )

        # =========================================
        # EVENT HELPER
        # =========================================

        def create_event(
            title,
            status,
            start_date,
            end_date,
            deadline,
            capacity,
            description,
        ):
            event, _ = (
                Event.objects.update_or_create(
                    ngo=ngo,
                    title=title,
                    defaults={
                        "created_by": (
                            ngo_admin
                        ),
                        "coordinator": (
                            coordinator
                        ),
                        "description": (
                            description
                        ),
                        "location": (
                            "Dhaka, Bangladesh"
                        ),
                        "start_date": (
                            start_date
                        ),
                        "end_date": (
                            end_date
                        ),
                        "registration_deadline": (
                            deadline
                        ),
                        "volunteer_capacity": (
                            capacity
                        ),
                        "status": status,
                    },
                )
            )

            event.required_skills.set(
                [
                    skills[
                        "Event Management"
                    ],
                    skills[
                        "First Aid"
                    ],
                ]
            )

            return event

        # =========================================
        # 9. NORMAL OPEN EVENT
        # =========================================

        normal_event = create_event(
            title=(
                "Demo Community Food Drive"
            ),
            status=Event.Status.OPEN,
            start_date=(
                now + timedelta(days=10)
            ),
            end_date=(
                now
                + timedelta(
                    days=10,
                    hours=5,
                )
            ),
            deadline=(
                now + timedelta(days=8)
            ),
            capacity=20,
            description=(
                "Normal demo event where "
                "volunteer registration should "
                "work successfully."
            ),
        )

        # =========================================
        # 10. CLOSED EVENT
        # Decorator: EventOpenDecorator
        # =========================================

        closed_event = create_event(
            title=(
                "Decorator Demo - Closed Event"
            ),
            status=Event.Status.DRAFT,
            start_date=(
                now + timedelta(days=12)
            ),
            end_date=(
                now
                + timedelta(
                    days=12,
                    hours=4,
                )
            ),
            deadline=(
                now + timedelta(days=10)
            ),
            capacity=10,
            description=(
                "Used to demonstrate the "
                "EventOpenDecorator."
            ),
        )

        # =========================================
        # 11. DEADLINE PASSED EVENT
        # Decorator:
        # RegistrationDeadlineDecorator
        # =========================================

        deadline_event = create_event(
            title=(
                "Decorator Demo - Deadline Passed"
            ),
            status=Event.Status.OPEN,
            start_date=(
                now + timedelta(days=2)
            ),
            end_date=(
                now
                + timedelta(
                    days=2,
                    hours=4,
                )
            ),
            deadline=(
                now - timedelta(hours=1)
            ),
            capacity=10,
            description=(
                "Used to demonstrate the "
                "registration deadline decorator."
            ),
        )

        # =========================================
        # 12. FULL EVENT
        # Decorator: CapacityDecorator
        # =========================================

        full_event = create_event(
            title=(
                "Decorator Demo - Full Event"
            ),
            status=Event.Status.OPEN,
            start_date=(
                now + timedelta(days=7)
            ),
            end_date=(
                now
                + timedelta(
                    days=7,
                    hours=4,
                )
            ),
            deadline=(
                now + timedelta(days=5)
            ),
            capacity=1,
            description=(
                "Used to demonstrate the "
                "capacity decorator."
            ),
        )

        Registration.objects.update_or_create(
            event=full_event,
            volunteer=volunteer_profiles[1],
            defaults={
                "status": (
                    Registration.Status.APPROVED
                )
            },
        )

        # =========================================
        # 13. DUPLICATE REGISTRATION EVENT
        # Decorator:
        # DuplicateRegistrationDecorator
        # =========================================

        duplicate_event = create_event(
            title=(
                "Decorator Demo - "
                "Already Registered"
            ),
            status=Event.Status.OPEN,
            start_date=(
                now + timedelta(days=9)
            ),
            end_date=(
                now
                + timedelta(
                    days=9,
                    hours=4,
                )
            ),
            deadline=(
                now + timedelta(days=7)
            ),
            capacity=20,
            description=(
                "DemoVolunteer is already "
                "registered for this event."
            ),
        )

        Registration.objects.update_or_create(
            event=duplicate_event,
            volunteer=volunteer_profiles[0],
            defaults={
                "status": (
                    Registration.Status.PENDING
                )
            },
        )

        # =========================================
        # 14. IN-PROGRESS EVENT
        # Used for Facade + Factory demo
        # =========================================

        facade_event = create_event(
            title=(
                "Facade Demo - Health Camp"
            ),
            status=Event.Status.IN_PROGRESS,
            start_date=(
                now - timedelta(hours=2)
            ),
            end_date=(
                now + timedelta(hours=3)
            ),
            deadline=(
                now - timedelta(days=1)
            ),
            capacity=20,
            description=(
                "Used to demonstrate event "
                "completion, volunteer hours "
                "and certificate generation."
            ),
        )

        # Present volunteer
        Registration.objects.update_or_create(
            event=facade_event,
            volunteer=volunteer_profiles[0],
            defaults={
                "status": (
                    Registration.Status.APPROVED
                ),
                "attendance_status": (
                    Registration
                    .AttendanceStatus
                    .PRESENT
                ),
            },
        )

        # Absent volunteer
        Registration.objects.update_or_create(
            event=facade_event,
            volunteer=volunteer_profiles[1],
            defaults={
                "status": (
                    Registration.Status.APPROVED
                ),
                "attendance_status": (
                    Registration
                    .AttendanceStatus
                    .ABSENT
                ),
            },
        )

        # =========================================
        # 15. EXTRA REGISTRATION
        # =========================================

        Registration.objects.update_or_create(
            event=normal_event,
            volunteer=volunteer_profiles[2],
            defaults={
                "status": (
                    Registration.Status.PENDING
                )
            },
        )

        # =========================================
        # 16. DEMO DONATIONS
        # =========================================

        Donation.objects.get_or_create(
            ngo=ngo,
            donor=donor,
            donor_name="Demo Donor",
            amount=Decimal("5000.00"),
            defaults={
                "allocation_details": (
                    "Food and medical supplies"
                ),
                "acknowledgement_sent": True,
            },
        )

        Donation.objects.get_or_create(
            ngo=ngo,
            donor=None,
            donor_name="Anonymous Donor",
            amount=Decimal("2500.00"),
            defaults={
                "allocation_details": (
                    "Education materials"
                ),
                "acknowledgement_sent": False,
            },
        )

        # =========================================
        # FINISHED
        # =========================================

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "================================"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "DEMO DATA CREATED SUCCESSFULLY"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "================================"
            )
        )

        self.stdout.write("")
        self.stdout.write(
            "All demo passwords:"
        )
        self.stdout.write(
            "DemoPass123!"
        )

        self.stdout.write("")
        self.stdout.write(
            "Volunteer: DemoVolunteer"
        )
        self.stdout.write(
            "NGO Admin: DemoNGOAdmin"
        )
        self.stdout.write(
            "Coordinator: DemoCoordinator"
        )
        self.stdout.write(
            "Donor: DemoDonor"
        )

        self.stdout.write("")
        self.stdout.write(
            "Decorator demo events:"
        )
        self.stdout.write(
            "- Decorator Demo - Closed Event"
        )
        self.stdout.write(
            "- Decorator Demo - Deadline Passed"
        )
        self.stdout.write(
            "- Decorator Demo - Full Event"
        )
        self.stdout.write(
            "- Decorator Demo - Already Registered"
        )

        self.stdout.write("")
        self.stdout.write(
            "Facade/Factory demo:"
        )
        self.stdout.write(
            "- Facade Demo - Health Camp"
        )