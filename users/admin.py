from typing import Any, Optional
from .models import User
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

class UserModelAdmin(UserAdmin):
    fields = [('first_name', 'last_name','gender'),'phone_no','email','is_active','is_staff','is_superuser','groups','user_permissions',]
    readonly_fields = ['date_joined','last_login',]
    fieldsets = None
    ordering = ['phone_no', 'first_name', 'last_name']
    actions_selection_counter = True
    date_hierarchy = 'date_joined'
    list_display = ['phone_no', 'first_name', 'last_name','is_active','is_staff','is_superuser', 'date_joined']
    list_editable = ['is_active']
    search_fields = ['phone_no', 'first_name', 'last_name']
    
    def get_form(self, request: Any, obj=None, **kwargs: Any):
        form = super().get_form(request, obj=obj,**kwargs)
        is_superuser = request.user.is_superuser
        disabled_fields = set()
        if not is_superuser:
            disabled_fields |= {
                'phone_no',
                'is_superuser',
                'is_staff',
                'user_permissions'
            }
            
        if (not is_superuser and obj is not None and obj == request.user):
            disabled_fields |= {
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions'
            }
        for f in disabled_fields:
            if f in form.base_fields:
                form.base_fields[f].disabled = True
        return form
    
admin.site.register(User,UserModelAdmin)