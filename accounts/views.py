from logging import log
from django.shortcuts import render
from django.http import HttpRequest
from django.contrib.auth.decorators import login_required

@login_required
def deposit(request:HttpRequest):
    if request.method == "POST":
        pass
    
    return render(request, 'accounts/deposit.html', {
        
    })

@login_required
def checkout_request(request:HttpRequest):
    if request.method == "POST":
        pass
    
    return render(request, 'accounts/checkout.html', {
        
    })
    
@login_required
def get_wallet(request: HttpRequest):
    return render(request, 'account/wallet.html')