from django.shortcuts import render
from django.http import HttpRequest

def home(request:HttpRequest):
    return render(request, 'home/home.html')

def aboutUs(request:HttpRequest):
    pass

def rules(request:HttpRequest):
    pass

def contactUs(request:HttpRequest):
    pass

def FAQS(request:HttpRequest):
    pass

