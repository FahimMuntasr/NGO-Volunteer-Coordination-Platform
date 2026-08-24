from abc import ABC, abstractmethod

# Component
class DonationAcknowledgement(ABC):

    @abstractmethod
    def generate(self, donation):
        pass

# Concrete Component
class BasicDonationAcknowledgement(
    DonationAcknowledgement
):

    def generate(self, donation):
        return (
            f"Donation Amount: ৳{donation.amount}"
        )

# Decorator
class DonationAcknowledgementDecorator(
    DonationAcknowledgement
):

    def __init__(self, acknowledgement):
        self.acknowledgement = acknowledgement

    def generate(self, donation):
        return self.acknowledgement.generate(
            donation
        )

# Concrete Decorator
class DonorDetailsDecorator(
    DonationAcknowledgementDecorator
):

    def generate(self, donation):
        content = super().generate(donation)

        return (
            content
            + f"\nDonor: {donation.donor_name}"
        )

# Concrete Decorator
class NGOInformationDecorator(
    DonationAcknowledgementDecorator
):

    def generate(self, donation):
        content = super().generate(donation)

        return (
            content
            + f"\nNGO: {donation.ngo.name}"
        )

# Concrete Decorator
class AllocationDetailsDecorator(
    DonationAcknowledgementDecorator
):

    def generate(self, donation):
        content = super().generate(donation)

        if donation.allocation_details:
            content += (
                "\nAllocation: "
                + donation.allocation_details
            )

        return content