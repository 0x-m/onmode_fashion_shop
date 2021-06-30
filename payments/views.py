from django.db.models.query import RawQuerySet
from django.shortcuts import render
from django.http import HttpResponse, HttpRequest
from django.shortcuts import redirect
import requests
import json

merchant_id = '1344b5d4-0048-11e8-94db-005056a205be'
amount = 1000  # Toman / Required
description = "توضیحات مربوط به تراکنش را در این قسمت وارد کنید"  # Required
email = 'email@example.com'  # Optional
mobile = '09179827587'  # Optional
callbck_url = 'http://localhost:8000/payments/verify/' # Important: need to edit for realy server.


def send_request(request: HttpRequest):
    params = {
        'merchant_id':merchant_id,
        'amount':1000,
        'callback_url':callbck_url,
        'description':'product name',
         'metadata': {
             'mobile':mobile
         }
    }
    headers = {
        'content-type': 'application/json',
        'accept': 'application/json'
    }
    
    req = requests.post('https://sandbox.zarinpal.com/pg/v4/payment/request.json', headers=headers)
    print('-----------',req.headers['content-type'])
    return HttpResponse(req.content)
    res = json.loads(req.json())
    if res['data']['code'] == 100:  
        return redirect('https://www.sandbox.zarinpal.com/pg/StartPay/'+ res['authority'])
    else:
        return HttpResponse('error: ' + str(res['status']))
    

    

def verify(request:HttpRequest):
    if request.GET.get('Status') == 'OK':
        authority = request.GET.get('Authority')
        params = {
        'merchant_id':merchant_id,
        'amount':1000,
        'authority': authority
        }
        headers = {
            'content-type': 'applicatioin/json',
            'accept': 'application/json'
        }
        req = requests.post('https://sandbox.zarinpal.com/pg/v4/payment/verify.json')
        res = json.load(req.json())
        if res['code'] == 100:
            return HttpRequest("transaction sucess.\n refid: " + str(res['ref_id']))
        elif res['code'] == 101:
            return HttpResponse("transaction submitted\n status:" + str(res['status']))
        else:
            return HttpResponse("transaction falied code:" + str(res['code']))
    else:
        return HttpResponse("transcation faild or canceled by user")

