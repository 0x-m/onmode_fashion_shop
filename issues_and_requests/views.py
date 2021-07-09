from django.http.response import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.http import HttpRequest
from django.contrib.auth.decorators import login_required
from .models import Appeal
from shops.models import Shop

@login_required
def make_appeal(request:HttpRequest):

    appeal = Appeal.objects.filter(user=request.user).first()
    if request.method == 'POST':
        if appeal:
            return render(request,'issues_requests/appeal.html',{
                'appeal': appeal
            })
        
        page_name = request.POST.get('page_name')
        description = request.POST.get('description')
        
        if not page_name:
            return HttpResponseBadRequest("page name is not provided")
        shop =  Shop.objects.filter(name=page_name).exists()
        
        if shop:
            return HttpResponseBadRequest("the boutique with name %s is already exist" % page_name)
        appeal = Appeal(user=request.user, page_name=page_name)
        appeal.save()
        return HttpResponse("an appeal is registered")
  
    return render(request, 'issues_requests/appeal.html', {
        'appeal': appeal
    })
    
