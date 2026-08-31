from django.http import JsonResponse


class FeatureFlagMiddleware:
    """
    Adds a simple feature-flag helper to every Django request.

    Usage inside a view:

        request.flag_enabled("new-dashboard")
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        def flag_enabled(flag_key, user_id=None):
            from .feature_flags import flag_enabled as evaluate

            return evaluate(
                flag_key=flag_key,
                user_id=user_id,
            )

        request.flag_enabled = flag_enabled

        response = self.get_response(request)
        
        request.flag_enabled(
    "new-dashboard"
)

        return response