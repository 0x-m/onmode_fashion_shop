from django.core.validators import ip_address_validator_map
from django.http.response import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render, resolve_url
from django.http import HttpRequest
from django.contrib.auth.decorators import login_required
from .models import Appeal, Issue, IssuesSubject
from .forms import IssueForm
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
        return render(request, 'utils/operation_done.html',{
            'description': 'درخواست شما ثبت شد'
        })
  
    return render(request, 'topic/request_for_boutique.html', {
        'appeal': appeal
    })
    

def make_issue(request:HttpRequest):
    if request.method == "POST":
        if request.user.is_anonymous:
            return
        
        form = IssueForm(request.POST)
        if form.is_valid():
            issue = form.save(commit=False)
            issue.user = request.user
            issue.save()
            return render(request, 'utils/operation_done.html', {
                'description': 'تقاضا شما ثبت شد.'
            })
        else:
            return HttpResponseBadRequest('invalid inputs')

        
    subjects = IssuesSubject.objects.all()
    return render(request,'topic/issue.html',{
        'subjects': subjects,
   
    })

def issue_page(request: HttpResponse):
    return render(request, 'topic/issue.html')