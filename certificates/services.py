from .factory import DocumentGeneratorFactory
from .models import Certificate


class CertificateService:

    @staticmethod
    def generate_for_registration(registration):

        certificate, created = Certificate.objects.get_or_create(
            volunteer=registration.volunteer,
            event=registration.event,
        )

        if not certificate.file:

            generator = DocumentGeneratorFactory.create(
                "certificate"
            )

            pdf_file = generator.generate(
                {
                    "volunteer": registration.volunteer,
                    "event": registration.event,
                    "verification_code": (
                        certificate.verification_code
                    ),
                }
            )

            filename = (
                f"certificate_"
                f"{registration.event.id}_"
                f"{registration.volunteer.id}.pdf"
            )

            certificate.file.save(
                filename,
                pdf_file,
                save=True,
            )

        return certificate