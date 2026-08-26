from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # Delete the current user's authentication token.
        if request.auth:
            request.auth.delete()

        return Response(
            {
                "detail": "Logged out successfully."
            },
            status=status.HTTP_200_OK,
        )