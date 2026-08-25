from abc import ABC, abstractmethod

from .strategies import (
    default_coordinator_strategies,
    default_ngo_administrator_strategies,
    default_volunteer_strategies,
)

# OBSERVER INTERFACE
class Observer(ABC):
    @abstractmethod
    def update(self, domain_event):
        pass


# SUBJECT INTERFACE
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


# CONCRETE SUBJECT

class NotificationSubject(Subject):
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


# CONCRETE OBSERVERS

class StrategyDrivenObserver(Observer):
    def __init__(self, strategies):
        self._strategies = list(strategies)

    def update(self, domain_event):
        for strategy in self._strategies:
            if strategy.handles(domain_event):
                strategy.notify(domain_event)


class VolunteerNotificationObserver(StrategyDrivenObserver):
    def __init__(self, strategies=None):
        super().__init__(strategies or default_volunteer_strategies())


class NGOAdministratorNotificationObserver(StrategyDrivenObserver):
    def __init__(self, strategies=None):
        super().__init__(
            strategies or default_ngo_administrator_strategies()
        )


class CoordinatorNotificationObserver(StrategyDrivenObserver):
    def __init__(self, strategies=None):
        super().__init__(strategies or default_coordinator_strategies())


notification_subject = NotificationSubject()

notification_subject.attach(VolunteerNotificationObserver())
notification_subject.attach(NGOAdministratorNotificationObserver())
notification_subject.attach(CoordinatorNotificationObserver())