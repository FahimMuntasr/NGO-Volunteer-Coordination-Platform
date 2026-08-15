from abc import ABC, abstractmethod

from .products import (
    AttendanceReportGenerator,
    DocumentGenerator,
    ParticipationCertificateGenerator,
)

# CREATOR

class DocumentCreator(ABC):

    @abstractmethod
    def factory_method(self) -> DocumentGenerator:
        pass

    def create_document(self, context):
        """
        Common operation that uses the object returned
        by the factory method.
        """

        generator = self.factory_method()

        return generator.generate(context)

# CONCRETE CREATOR 1

class ParticipationCertificateCreator(DocumentCreator):

    def factory_method(self) -> DocumentGenerator:
        return ParticipationCertificateGenerator()


# CONCRETE CREATOR 2

class AttendanceReportCreator(DocumentCreator):

    def factory_method(self) -> DocumentGenerator:
        return AttendanceReportGenerator()