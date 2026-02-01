# connect/services/roles.py
from django.contrib.auth.models import Group

def ensure_user_in_group(user, group_name: str) -> bool:
    """
    Ensures user is in the given Django auth Group.
    Returns True if added now, False if user already had it.
    """
    group, _ = Group.objects.get_or_create(name=group_name)
    if user.groups.filter(id=group.id).exists():
        return False
    user.groups.add(group)
    return True
