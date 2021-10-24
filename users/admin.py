from typing import Any, Optional
from django.contrib.admin.options import ModelAdmin
from django.db.models import fields
from django.forms.widgets import PasswordInput
from .models import Address, User
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
from jalali_date.admin import ModelAdminJalaliMixin, StackedInlineJalaliMixin, TabularInlineJalaliMixin	
from jalali_date import datetime2jalali, date2jalali
from django.utils.translation import gettext_lazy as _



class AddressInline(admin.StackedInline):
    model = Address



class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label=_('password'),widget=forms.PasswordInput)
    password2 = forms.CharField(label=_('password confirmation'),widget=PasswordInput)
    def clean_password2(self):
        password1 = self.cleaned_data['password1']
        password2 = self.cleaned_data['password2']
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("passwords don't match")
        return password2
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user
    
    class Meta:
        model = User
        fields = ['phone_no','email']

class UserModelAdmin(ModelAdminJalaliMixin,UserAdmin):
   # fields = [('first_name', 'last_name','gender'),'phone_no','email','is_active','is_staff','is_superuser','groups','user_permissions',]

    add_form = UserCreationForm
    fieldsets = ((_("Phone Number (Username)"),{
        "fields": ['phone_no',]
        }),
        (_("Other informations"),{
            'fields': ('id','first_name','last_name','gender','email','merchan_card','user_code','points')
        }),
        (_('History'),{
            'fields':('date_joined','last_login',)
        }),
        (_('Privileges'),{
            'fields': ('is_active','is_staff','is_superuser')
        }),
        (_('Groups and Permissions'),{
            'fields': ('groups',),
            
        }),

    )
    inlines = [
        AddressInline
    ]
    readonly_fields = ['date_joined','last_login','user_code','id']
    ordering = ['phone_no', 'first_name', 'last_name']
    actions_selection_counter = True
    date_hierarchy = 'date_joined'
    list_display = ['phone_no', 'first_name', 'last_name','is_active','is_staff','is_superuser', 'get_joined_date']
    list_editable = ['is_active']
    search_fields = ['phone_no', 'first_name', 'last_name']
    
    add_fieldsets = (
        (None,{
            'fields':('phone_no','email','password1', 'password2')
        }),
    )
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
    
    def get_joined_date(self, obj):
        return datetime2jalali(obj.date_joined).strftime('%y/%m/%d  %H:%M:%S')
    get_joined_date.short_description = 'تاریخ ایجاد کاربر'
    get_joined_date.admin_orde_field = 'date_join'
    
admin.site.register(User,UserModelAdmin)

# @admin.register(Address)
# class AddressAdmin(ModelAdmin):
#     list_display = ['user','state','city','town','postal_code']
