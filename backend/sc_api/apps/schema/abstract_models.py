import uuid

from django.db import models
from django.utils import timezone


class GlobalAbstractModel(models.Model):
    oid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
