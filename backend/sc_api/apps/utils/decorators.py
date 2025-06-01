import logging
from functools import wraps

from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def params_required(params=()):
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            for param in params:
                try:
                    if param not in request.data.keys():
                        raise AttributeError
                except AttributeError:
                    message = f"{param} missing in the request payload"
                    logger.error(message)
                    return Response(data={"message": message}, status=status.HTTP_400_BAD_REQUEST)
            return func(self, request, *args, **kwargs)

        return wrapper

    return decorator
