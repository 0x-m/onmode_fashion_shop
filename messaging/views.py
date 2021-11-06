from django.http.response import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpRequest
from .models import AdminMessage
@login_required
def get_messages(request:HttpRequest):
    messages = request.user.recieved_messages.all().order_by('-date_created')

    return render(request, 'messaging/messages.html',{
        'messages': messages
    })

@login_required
def remove_message(request:HttpRequest):
    pass

@login_required
def mark_as_read(request: HttpRequest, msg_id):
    msg =  request.user.recieved_messages.filter(id=msg_id).first()
    if not msg:
        return HttpResponseBadRequest()
    msg.remove()
    return HttpResponse('ok')
        
    