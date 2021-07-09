from django import http
from django.contrib.sessions.backends.base import SessionBase
from django.forms.models import inlineformset_factory
from django.forms.widgets import Select
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
    print(request.POST.get('phone_no'))
    if request.method == 'POST':
        form = PhoenForm(request.POST)
        if form.is_valid():
            phone_no = form.cleaned_data['phone_no']
            request.session['phone_no'] = phone_no
            request.session['verified'] = 'False'
            secret = pyotp.random_base32()
            request.session['secret'] = secret
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
            
            totp = pyotp.TOTP(secret, interval=120)
            
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
        print(request.POST.get('code'))
        form = VerificationForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']
            phone_no = request.session.get('phone_no')
            if not phone_no:
                return HttpResponseBadRequest("no phone number")
            
            #validate code
            secret = request.session.get('secret')
            print(secret)
            totp  = pyotp.TOTP(secret,interval=120)
            if not totp.verify(code):
                return HttpResponseBadRequest("expired or invalid code")
            request.session['verified'] = 'True'
            request.session.save()
            return render(request, 'registration/password.html')
        else:
            return HttpResponseUnprocessableEntity("invalid code")
    #get
    return HttpResponseNotAllowed(['POST'])
            

def set_password(request:HttpRequest):
    if request.method == 'POST':
        
        verified = request.session.get('verified')
        print('verified: ',verified)
        if not verified or verified != 'True':
            return HttpResponseBadRequest("unauthenticated attempt")
       
        form = SetPasswordForm(request.POST)
        if form.is_valid():
            phone_no = request.session.get('phone_no')
            if not phone_no:
                return HttpResponseBadRequest("phone no is not set")
            
            password = form.cleaned_data['password']
            print(password)
            user = User.objects.filter(phone_no=phone_no).first()
            if not user:
                user = User(phone_no=phone_no)
            user.backend = 'users.CustomAuthenticationBackend.PhoneAuthentication'
            user.set_password(password)
            user.save()
            
            login(request, user)
            del request.session['phone_no']
            del request.session['verified']
            return render(request,'user/dashboard.html')
        else:
            return HttpResponseUnprocessableEntity(form.errors)

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
                user.backend = 'users.CustomAuthenticationBackend.PhoneAuthentication'
                login(request, user,backend='users.CustomAuthenticationBackend.PhoneAuthentication')
                del request.session['phone_no']
                if request.session.get('verified'):
                    del request.session['verified']
                request.session.save()
                return render(request, 'user/dashboard.html')
            else:
                return HttpResponseBadRequest("incorrect password...try again")
            
        else:
            return HttpResponseUnprocessableEntity("invalid password")
    return HttpResponseNotAllowed(['POST'])

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




