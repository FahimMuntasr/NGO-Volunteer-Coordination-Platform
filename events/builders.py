from abc import ABC, abstractmethod

from .models import Event


class EventBuilder(ABC):
    def __init__(self):
        self.reset()

    def reset(self):
        self._event_data = {}
        self._required_skills = []

    def set_ownership(self, ngo, created_by):
        self._event_data["ngo"] = ngo
        self._event_data["created_by"] = created_by

    def set_basic_details(self, title, description, location):
        self._event_data["title"] = title
        self._event_data["description"] = description
        self._event_data["location"] = location

    def set_schedule(self, start_date, end_date, registration_deadline):
        self._event_data["start_date"] = start_date
        self._event_data["end_date"] = end_date
        self._event_data["registration_deadline"] = registration_deadline

    def set_capacity(self, volunteer_capacity):
        self._event_data["volunteer_capacity"] = volunteer_capacity

    def set_required_skills(self, required_skills):
        self._required_skills = list(required_skills)

    @abstractmethod
    def set_status(self):
        pass

    def build(self):
        event = Event(**self._event_data)
        event.full_clean()
        event.save()

        event.required_skills.set(self._required_skills)
        return event


class DraftEventBuilder(EventBuilder):
    def set_status(self):
        self._event_data["status"] = Event.Status.DRAFT


class PublishedEventBuilder(EventBuilder):
    def set_status(self):
        self._event_data["status"] = Event.Status.OPEN


class EventDirector:
    def build_event(
        self,
        builder,
        *,
        ngo,
        created_by,
        title,
        description,
        location,
        start_date,
        end_date,
        registration_deadline,
        volunteer_capacity,
        required_skills,
    ):
        builder.reset()

        builder.set_ownership(ngo, created_by)
        builder.set_basic_details(title, description, location)
        builder.set_schedule(
            start_date,
            end_date,
            registration_deadline,
        )
        builder.set_capacity(volunteer_capacity)
        builder.set_required_skills(required_skills)
        builder.set_status()

        return builder.build()