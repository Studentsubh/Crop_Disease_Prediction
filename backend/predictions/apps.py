from django.apps import AppConfig
import logging
import threading

logger = logging.getLogger(__name__)

class PredictionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'predictions'

    def ready(self):
        # Prevent double loading in dev server auto-reload
        import os
        if os.environ.get('RUN_MAIN') == 'true' or not os.environ.get('DJANGO_DEBUG'):
            # Preload model in a background thread to prevent blocking startup,
            # but ensure it loads as a singleton.
            def load_model_async():
                try:
                    from .ml.model_loader import get_model
                    logger.info("Initializing Keras model singleton...")
                    get_model()
                    logger.info("Keras model loaded successfully.")
                except Exception as e:
                    logger.error(f"Error loading Keras model at startup: {e}")

            thread = threading.Thread(target=load_model_async)
            thread.daemon = True
            thread.start()
