from django.db.models import fields
from .models import Issue
from django import forms
from django.core.validators import RegexValidator

class AppealforBoutiqueForm(forms.Form):
    page_name = forms.CharField(max_length=50, validators=[
        RegexValidator('^[a-z0-9_]{4,}$')
    ])
    description = forms.CharField(max_length=1000)
    

    
class IssueForm(forms.ModelForm):
    class Meta:
        model=Issue
        fields= ['subject', 'description']