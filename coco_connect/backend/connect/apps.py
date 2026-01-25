# connect/apps.py
from django.apps import AppConfig

class ConnectConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "connect"

    def ready(self):
        # 🔥 disable warmup - it blocks runserver
        pass
