from django import forms
from django.forms.models import model_to_dict

class CommentForm(forms.Form):
    comment_title = forms.CharField(max_length=100)
    comment_body = forms.CharField(max_length=5000)
    