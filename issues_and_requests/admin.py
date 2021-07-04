from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Appeal, Issue, IssuesSubject

@admin.register(Appeal)
class AppealAdmin(admin.ModelAdmin):
    
   # @admin.action(description=_('accept appeals'))
    def accept_appeal(modeladmin, request, queryset):
        for ap in queryset:
            ap.accept()
    

   # @admin.action(description=_('Reject appeals'))
    def reject_appeal(modeladmin, reaquest, queryset):
        for ap in queryset:
            ap.reject()
            
    
    list_display = ['user', 'page_name', 'state', 'date_created']
    readonly_fields = ['date_created']
    actions = [accept_appeal, reject_appeal]

@admin.register(IssuesSubject)
class IssueAdmin(admin.ModelAdmin):
    pass

@admin.register(Issue)
class Issue(admin.ModelAdmin):
    pass