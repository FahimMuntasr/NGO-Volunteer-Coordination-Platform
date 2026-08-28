from abc import ABC, abstractmethod

from .products import (
    AttendanceReportGenerator,
    DocumentGenerator,
    ParticipationCertificateGenerator,
)

# CREATOR

class DocumentCreator(ABC):

    @abstractmethod
    def factory_method(self):
        pass

    def create_document(self, context):
        generator = self.factory_method()

        return generator.generate(context)

# CONCRETE CREATOR 1

class ParticipationCertificateCreator(DocumentCreator):

    def factory_method(self):
        return ParticipationCertificateGenerator()


# CONCRETE CREATOR 2

class AttendanceReportCreator(DocumentCreator):

    def factory_method(self):
        return AttendanceReportGenerator()