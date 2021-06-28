from django import http
from django.forms.models import inlineformset_factory
from django.http.response import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseServerError
from django.shortcuts import render, resolve_url
from django.http import HttpRequest, request
from http import HTTPStatus
import logging
from .forms import *
import pyotp
from .models import User
from django.contrib.auth import authenticate, login,logout
from django.contrib.auth.decorators import login_required

#--------------------LOGGING CONFIG--------------
logger = logging.getLogger(__name__)
f_handller = logging.FileHandler('logs/users.log','w')
formatter = logging.Formatter('%(name)s - %(levelname)s - %(message)s -- %(lineno)d')
logger.setLevel('DEBUG')
f_handller.setFormatter(formatter)
logger.addHandler(f_handller)
#-------------------------------------------------


#-----------helpers-------------------------------------
class HttpResponseUnprocessableEntity(HttpResponse):
    status_code = HTTPStatus.UNPROCESSABLE_ENTITY #422
        

def enrollment(request:HttpRequest):
    if request.user.is_authenticated:
        logger.warning("an authenticated user issues an enrollment")
        return render(request, 'user/dashboard.html')
    
    if request.method == 'POST':
        form = PhoenForm(request.POST)
        if form.is_valid():
            phone_no = form.cleaned_data['phone_no']
            request.session['phone_no'] = phone_no
            request.session.save()
            logger.info("phone_no is saved into session")
        else:
            return HttpResponseUnprocessableEntity("invalid pohne number")
        
        user = User.objects.filter(phone_no=phone_no).first()
        
        if user: #user does exist
            #goto login form
            return render(request, 'registration/login.html',{
                'phone_no': phone_no
            })
        else: #use does not exist
            #generate time-based one time password
            totp = pyotp.TOTP('base32secret3232',interval=120)
            verification_code = totp.now()
            #send otp via sms
            is_sent  = True
            if is_sent:
                #goto setpassword 
                return render(request, 'registration/verification.html',
                              {'code':verification_code })
            else:
                return HttpResponseServerError("falid to send sms.")
    
    #request method is get:
    return render(request, 'registration/phone.html')
            
            
            

def verification(request:HttpRequest):
    if request.method == 'POST':
        form = VerificationForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']
            phone_no = request.session['phone_no']
            if not phone_no:
                pass
            
            #validate code
            totp  = pyotp.TOTP('base32secret3232',interval=120)
            if not totp.verify(code):
                return HttpResponseUnprocessableEntity("expired or invalid code")
            return render(request, 'registration/password.html')
        else:
            return HttpResponseUnprocessableEntity("invalid code")
    #get
    return HttpResponseNotAllowed(['POST'])
            

def set_password(request:HttpRequest):
    if request.method == 'POST':
        form = SetPasswordForm(request.POST)
        if form.is_valid():
            phone_no = request.session.get('phone_no')
            if not phone_no:
                pass
            
            password = form.cleaned_data['password']
            print(password)
            user = User.objects.filter(phone_no=phone_no).first()
            if not user:
                user = User(phone_no=phone_no)
            user.set_password(password)
            user.save()
            
            login(request, user)
            return render(request,'user/dashboard.html')
        else:
            return HttpResponseUnprocessableEntity(form.errors)
        
    #request.method == 'get'
    return HttpResponseNotAllowed(['POST'])


def login_user(request:HttpRequest):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            phone_no = request.session.get('phone_no')
            if not phone_no:
                return HttpResponseUnprocessableEntity("invalid phone number")
            
            password = form.cleaned_data['password']       
            user = authenticate(phone_no=phone_no, password=password)
            if user :
                login(request, user)
                return render(request, 'user/dashboard.html')
            else:
                return HttpResponseBadRequest("try again")
            
        else:
            return HttpResponseUnprocessableEntity("invalid password")

@login_required
def logout_user(request:HttpRequest):
    logout(request)
    return render(request, "registration/phone.html")

@login_required
def dashboard(request:HttpRequest):
    return render(request,'user/dashboard.html')

@login_required
def profile(request:HttpRequest):
    if request.method ==  'POST':
        profile_form  = ProfileForm(request.POST, instance=request.user)
        address_form = AddressForm(request.POST, instance=request.user.address)
        
        if profile_form.is_valid() and address_form.is_valid():
            address = address_form.save()
            user = profile_form.save(commit=False)
            user.address = address
            user.save()
        else:
            return HttpResponseUnprocessableEntity("invalid inputs")
    
    return render(request, 'user/profile.html')




