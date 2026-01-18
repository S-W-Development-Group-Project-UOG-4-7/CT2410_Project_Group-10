from django.apps import AppConfig

class ConnectConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "connect"

    def ready(self):
        # warm up the AI model when Django starts (faster publish later)
        from .services.embeddings import get_embedding
        get_embedding("warmup")
