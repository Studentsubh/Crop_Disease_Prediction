from rest_framework import serializers
from django.conf import settings

class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField(required=True)

    def validate_image(self, value):
        # 1. Validate File Size
        max_size = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size exceeds the {settings.MAX_IMAGE_SIZE_MB}MB limit."
            )

        # 2. Validate MIME Type
        content_type = getattr(value, 'content_type', None)
        if content_type and content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise serializers.ValidationError(
                "Invalid file type. Only JPEG and PNG images are supported."
            )
            
        return value
