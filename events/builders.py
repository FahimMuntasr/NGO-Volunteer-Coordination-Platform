from abc import ABC, abstractmethod

from .models import Event


class EventBuilder(ABC):
    def __init__(self):
        self.reset()

    def reset(self):
        self._event_data = {}
        self._required_skills = []
        return self

    @abstractmethod
    def set_event_type(self):
        """Configure the concrete event representation."""
        raise NotImplementedError

    def set_ownership(self, ngo, created_by):
        self._event_data["ngo"] = ngo
        self._event_data["created_by"] = created_by
        return self

    def set_basic_details(self, title, description, location):
        self._event_data["title"] = title
        self._event_data["description"] = description
        self._event_data["location"] = location
        return self

    def set_schedule(self, start_date, end_date, registration_deadline):
        self._event_data["start_date"] = start_date
        self._event_data["end_date"] = end_date
        self._event_data["registration_deadline"] = registration_deadline
        return self

    def set_capacity(self, volunteer_capacity):
        self._event_data["capacity_mode"] = Event.CapacityMode.FIXED
        self._event_data["volunteer_capacity"] = volunteer_capacity
        return self

    def set_unlimited_capacity(self):
        self._event_data["capacity_mode"] = Event.CapacityMode.UNLIMITED
        self._event_data["volunteer_capacity"] = None
        return self

    def assign_coordinator(self, coordinator):
        self._event_data["coordinator"] = coordinator
        return self

    def set_status(self):
        # Events created through the event-management workflow start as drafts.
        self._event_data["status"] = Event.Status.DRAFT
        return self

    @abstractmethod
    def set_required_skills(self, required_skills):
        """Configure the skill representation for this concrete builder."""
        raise NotImplementedError

    def build(self):
        self.set_event_type()

        event = Event(**self._event_data)
        event.full_clean()
        event.save()
        event.required_skills.set(self._required_skills)

        return event


class GeneralEventBuilder(EventBuilder):
    def set_event_type(self):
        # General events simply have no required skills.
        self._required_skills = []
        return self

    def set_required_skills(self, required_skills):
        # A general event intentionally ignores skill requirements.
        # Use SkillBasedEventBuilder when skills are part of the event.
        self._required_skills = []
        return self


class SkillBasedEventBuilder(EventBuilder):
    def set_event_type(self):
        return self

    def set_required_skills(self, required_skills):
        self._required_skills = list(required_skills)
        return self


class EventDirector:
    def __init__(self, builder=None):
        self.builder = builder

    def set_builder(self, builder):
        self.builder = builder
        return self

    def _require_builder(self):
        if self.builder is None:
            raise ValueError("An EventBuilder must be set before building.")
        return self.builder

    def _start_event(self, *, ngo, created_by, title, description, location,
                     start_date, end_date, registration_deadline):
        return (
            self._require_builder()
            .reset()
            .set_ownership(ngo, created_by)
            .set_basic_details(title, description, location)
            .set_schedule(start_date, end_date, registration_deadline)
        )

    def _set_capacity(self, capacity_mode, volunteer_capacity):
        if capacity_mode == Event.CapacityMode.UNLIMITED:
            return self.builder.set_unlimited_capacity()
        return self.builder.set_capacity(volunteer_capacity)

    def build_event(
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
        volunteer_capacity=None,
        capacity_mode=Event.CapacityMode.FIXED,
    ):
        """Recipe 1: general event without a coordinator."""
        self._start_event(
            ngo=ngo,
            created_by=created_by,
            title=title,
            description=description,
            location=location,
            start_date=start_date,
            end_date=end_date,
            registration_deadline=registration_deadline,
        )

        return (
            self._set_capacity(capacity_mode, volunteer_capacity)
            .set_status()
            .build()
        )

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
        volunteer_capacity=None,
        capacity_mode=Event.CapacityMode.FIXED,
    ):
        """Recipe 2: event with a coordinator."""
        self._start_event(
            ngo=ngo,
            created_by=created_by,
            title=title,
            description=description,
            location=location,
            start_date=start_date,
            end_date=end_date,
            registration_deadline=registration_deadline,
        )

        return (
            self._set_capacity(capacity_mode, volunteer_capacity)
            .assign_coordinator(coordinator)
            .set_status()
            .build()
        )

    def build_event_with_skills(
        self,
        *,
        required_skills,
        ngo,
        created_by,
        title,
        description,
        location,
        start_date,
        end_date,
        registration_deadline,
        volunteer_capacity=None,
        capacity_mode=Event.CapacityMode.FIXED,
    ):
        """Recipe 3: skill-based event without a coordinator."""
        self._start_event(
            ngo=ngo,
            created_by=created_by,
            title=title,
            description=description,
            location=location,
            start_date=start_date,
            end_date=end_date,
            registration_deadline=registration_deadline,
        )

        return (
            self._set_capacity(capacity_mode, volunteer_capacity)
            .set_required_skills(required_skills)
            .set_status()
            .build()
        )

    def build_event_with_skills_and_coordinator(
        self,
        *,
        required_skills,
        coordinator,
        ngo,
        created_by,
        title,
        description,
        location,
        start_date,
        end_date,
        registration_deadline,
        volunteer_capacity=None,
        capacity_mode=Event.CapacityMode.FIXED,
    ):
        """Recipe 4: skill-based event with a coordinator."""
        self._start_event(
            ngo=ngo,
            created_by=created_by,
            title=title,
            description=description,
            location=location,
            start_date=start_date,
            end_date=end_date,
            registration_deadline=registration_deadline,
        )

        return (
            self._set_capacity(capacity_mode, volunteer_capacity)
            .set_required_skills(required_skills)
            .assign_coordinator(coordinator)
            .set_status()
            .build()
        )