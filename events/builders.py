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
        self._event_data["capacity_mode"] = Event.CapacityMode.FIXED
        self._event_data["volunteer_capacity"] = volunteer_capacity

    def set_unlimited_capacity(self):
        self._event_data["capacity_mode"] = Event.CapacityMode.UNLIMITED
        self._event_data["volunteer_capacity"] = None

    def set_required_skills(self, required_skills):
        self._required_skills = list(required_skills)

    def assign_coordinator(self, coordinator):
        self._event_data["coordinator"] = coordinator

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

    def __init__(self, builder=None):
        self.builder = builder

    def set_builder(self, builder):
        self.builder = builder

    def _set_capacity(self, capacity_mode, volunteer_capacity):
        if capacity_mode == Event.CapacityMode.UNLIMITED:
            self.builder.set_unlimited_capacity()
        else:
            self.builder.set_capacity(volunteer_capacity)

    def build_full_event(
        self,
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
        capacity_mode=Event.CapacityMode.FIXED,
    ):
        self.builder.reset()
        self.builder.set_ownership(ngo, created_by)
        self.builder.set_basic_details(title, description, location)
        self.builder.set_schedule(
            start_date,
            end_date,
            registration_deadline,
        )
        self._set_capacity(capacity_mode, volunteer_capacity)
        self.builder.set_required_skills(required_skills)
        self.builder.set_status()

        return self.builder.build()

    def build_event_with_coordinator(
        self,
        *,
        coordinator,
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
        capacity_mode=Event.CapacityMode.FIXED,
    ):
        self.builder.reset()
        self.builder.set_ownership(ngo, created_by)
        self.builder.set_basic_details(title, description, location)
        self.builder.set_schedule(
            start_date,
            end_date,
            registration_deadline,
        )
        self._set_capacity(capacity_mode, volunteer_capacity)
        self.builder.set_required_skills(required_skills)
        self.builder.assign_coordinator(coordinator)
        self.builder.set_status()

        return self.builder.build()

    def build_event_without_skills(
        self,
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
        capacity_mode=Event.CapacityMode.FIXED,
    ):
        self.builder.reset()
        self.builder.set_ownership(ngo, created_by)
        self.builder.set_basic_details(title, description, location)
        self.builder.set_schedule(
            start_date,
            end_date,
            registration_deadline,
        )
        self._set_capacity(capacity_mode, volunteer_capacity)
        self.builder.set_status()

        return self.builder.build()

    def build_assigned_event_without_skills(
        self,
        *,
        coordinator,
        ngo,
        created_by,
        title,
        description,
        location,
        start_date,
        end_date,
        registration_deadline,
        volunteer_capacity,
        capacity_mode=Event.CapacityMode.FIXED,
    ):
        self.builder.reset()
        self.builder.set_ownership(ngo, created_by)
        self.builder.set_basic_details(title, description, location)
        self.builder.set_schedule(
            start_date,
            end_date,
            registration_deadline,
        )
        self._set_capacity(capacity_mode, volunteer_capacity)
        self.builder.assign_coordinator(coordinator)
        self.builder.set_status()

        return self.builder.build()
