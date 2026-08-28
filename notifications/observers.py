from abc import ABC, abstractmethod

from .strategies import NotificationContext


#OBSERVER INTERFACE
class Observer(ABC):
    @abstractmethod
    def update(self, domain_event):
        pass


#SUBJECT INTERFACE
class Subject(ABC):
    @abstractmethod
    def attach(self, observer):
        pass

    @abstractmethod
    def detach(self, observer):
        pass

    @abstractmethod
    def notify(self, domain_event):
        pass


#CONCRETE OBSERVER
class VolunteerNotificationObserver(Observer):
    def __init__(self, volunteer):
        self.volunteer = volunteer
        self.context = NotificationContext()

    def update(self, domain_event):
        # The Observer does not choose the strategy. It delegates the
        # notification to the Strategy Context, which selects the
        # concrete strategy from the notification type.
        self.context.execute(
            domain_event,
            recipient=self.volunteer.user,
        )


#CONCRETE SUBJECT
class VolunteerNotificationSubject(Subject):
    def __init__(self):
        self._observers = []

    def attach(self, observer):
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer):
        if observer in self._observers:
            self._observers.remove(observer)

    def notify(self, domain_event):
        for observer in tuple(self._observers):
            observer.update(domain_event)


def create_volunteer_notification_subject(volunteers):
    """Create a Subject and register the supplied volunteer observers."""
    subject = VolunteerNotificationSubject()

    for volunteer in volunteers:
        subject.attach(
            VolunteerNotificationObserver(volunteer)
        )

    return subject


def notify_volunteers(volunteers, domain_event):
    """Build the volunteer observer list, then notify through Subject."""
    subject = create_volunteer_notification_subject(volunteers)
    subject.notify(domain_event)