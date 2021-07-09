from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpRequest

@login_required
def get_messages(request:HttpRequest):
    messages = request.user.recieved_messages.all().order_by('-date_created')

    return render(request, 'messaging/messages.html',{
        'messages': messages
    })

@login_required
def remove_message(request:HttpRequest):
    pass
