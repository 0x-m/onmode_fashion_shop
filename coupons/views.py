from django.http.response import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from onmode.coupons.models import Coupon
from django.http.request import HttpRequest
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def check(request:HttpRequest, code):
    coupon = Coupon.objects.filter(code=code)
    if not coupon:
        return HttpResponseNotFound("coupon does not exist")
    if not coupon.is_valid():
        return HttpResponseBadRequest("expired coupon")
    return HttpResponse("valid coupon")

    
    