from .generators import (
    AttendanceReportGenerator,
    ParticipationCertificateGenerator,
)


class DocumentGeneratorFactory:

    @staticmethod
    def create(document_type):

        generators = {
            "certificate": ParticipationCertificateGenerator,
            "attendance_report": AttendanceReportGenerator,
        }

        generator_class = generators.get(document_type)

        if generator_class is None:
            raise ValueError(
                f"Unsupported document type: {document_type}"
            )

        return generator_class()