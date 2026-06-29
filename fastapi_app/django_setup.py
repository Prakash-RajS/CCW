
#fastapi_app/django_setup.py
import os
import django

def setup_django():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "creator_backend.settings")
    django.setup()