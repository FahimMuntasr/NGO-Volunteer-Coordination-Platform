from .acknowledgement import (
    AllocationDetailsDecorator,
    BasicDonationAcknowledgement,
    DonorDetailsDecorator,
    NGOInformationDecorator,
)


class DonationAcknowledgementService:

    def generate(
        self,
        donation,
        include_donor=True,
        include_ngo=True,
        include_allocation=True,
    ):
        acknowledgement = (
            BasicDonationAcknowledgement()
        )

        if include_donor:
            acknowledgement = DonorDetailsDecorator(
                acknowledgement
            )

        if include_ngo:
            acknowledgement = NGOInformationDecorator(
                acknowledgement
            )

        if include_allocation:
            acknowledgement = AllocationDetailsDecorator(
                acknowledgement
            )

        return acknowledgement.generate(donation)