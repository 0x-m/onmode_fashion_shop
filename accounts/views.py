from logging import log
from django.db import reset_queries
from django.http.response import HttpResponse, HttpResponseBadRequest, HttpResponseRedirect
from django.shortcuts import render
from django.http import HttpRequest, request
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db.models.aggregates import Sum
from accounts.models import CheckoutRequest
@login_required
def deposit(request:HttpRequest):
    if request.method == "POST":
        amount = request.POST.get('amount')
        if not amount:
            return
        
    
    return render(request, 'accounts/deposit.html', {
        
    })
    
def deposit_result(request:HttpRequest):
    pass

@login_required
def withdraw(request: HttpRequest):
    amount = request.GET.get('amount', None)
    last_checkout = request.user.checkouts.last()
    last_checkout_date = None
    if last_checkout:
        last_checkout_date = last_checkout.date_created
    try:
        amount = int(amount)
    except:
        return HttpResponse('invalid input')

    limit = timezone.now() - timezone.timedelta(days=7)
    if last_checkout_date:
        if limit <= last_checkout_date:
            return HttpResponseBadRequest('you are not allowed')
    
    cc = CheckoutRequest(
        applicant= request.user,
        amount=amount,
    )
    cc.save()
    return HttpResponse('registered')
    


@login_required
def checkout_request(request:HttpRequest):
    if request.method == "POST":
        pass
    
    return render(request, 'accounts/checkout.html', {
        
    })
    
@login_required
def get_wallet(request: HttpRequest):
    last_checkout = request.user.checkouts.last()
    allowed = True
    if last_checkout:
        allowed = timezone.now() - last_checkout.date_created >= timezone.timedelta(7)
    shop = request.user.shop.first()
    pending_money = 0
    total = request.user.account.balance
    if shop:
        pending_money = shop.orders.filter(state__in=['pending','cancelled','sent', 'accept', 'not_verified']).aggregate(Sum('discounted_total_price'))['discounted_total_price__sum']
    print(pending_money)
    if pending_money:
        total += pending_money

    return render(request, 'account/wallet.html', {
        'last_checkout': last_checkout,
        'allowed_checkout': allowed,
        'pending_money': pending_money,
        'total_money': total,
    })