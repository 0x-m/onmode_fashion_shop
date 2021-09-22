from django.http.response import HttpResponse
from django.shortcuts import render
from django.http import HttpRequest
from cart.cart import Cart
from .utils import *
from django.contrib.auth.decorators import login_required, user_passes_test
import json
from django.http import JsonResponse, HttpResponseBadRequest


def tss(request: HttpRequest):
    return render(request, 'registration/login.html');


def home(request:HttpRequest):

    return render(request, 'index/home/home.html', context= {
        'lss': range(50)
    })


def aboutUs(request:HttpRequest):
    pass

def rules(request:HttpRequest):
    pass

def contactUs(request:HttpRequest):
    pass

def FAQS(request:HttpRequest):
    pass



def get_province_cities(request:HttpRequest):
    print('sdfsf')
    print(request.GET.get('province_id'))
    province_id = request.GET.get('province_id')
    if province_id.isdigit:
        cities = get_cities(province_id)
        cities_dict = {
            'cities':cities
        }
        print(cities_dict)
        return JsonResponse(cities_dict);
        # return render(request,'utils/cities.html',{
        #     'cities': cities
        # })
    return HttpResponseBadRequest("Invalid province id")



def rules(request:HttpRequest):
    return render(request, 'rules.html')

def restricted(request:HttpRequest,*args):
    return render(request,'registration/code_expiration.html')