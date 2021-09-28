

from functools import cached_property
from django.http.response import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed, HttpResponseServerError, JsonResponse
from django.shortcuts import redirect, render
from django.http import HttpRequest, request
from http import HTTPStatus
import logging
from .forms import *
from .models import User, Address
from django.contrib.auth import authenticate, login,logout
from django.contrib.auth.decorators import login_required
from index.utils import get_cities, get_provinces
import secrets
from django.utils import timezone
# from ratelimit.decorators import ratelimit
#--------------------LOGGING CONFIG--------------
logger = logging.getLogger(__name__)
# f_handller = logging.FileHandler('logs/users.log','a')
# formatter = logging.Formatter('%(name)s - %(levelname)s - %(message)s -- %(lineno)d')
# logger.setLevel('DEBUG')
# f_handller.setFormatter(formatter)
# logger.addHandler(f_handller)
#-------------------------------------------------


#-----------helpers-------------------------------------
class HttpResponseUnprocessableEntity(HttpResponse):
    status_code = HTTPStatus.UNPROCESSABLE_ENTITY #422
    
def generate_code():
    alphbet = '0123456789'
    code = ''.join(secrets.choice(alphbet)for i in range(6))
    return code
        
# @ratelimit(key='ip',rate='10/m',block=True)
def enrollment(request:HttpRequest):
    if request.user.is_authenticated:
        logger.warning("an authenticated user issues an enrollment")
        return render(request, 'user/dashboard.html')

    if request.method == 'POST':
        form = PhoenForm(request.POST)
        if form.is_valid():
            phone_no = form.cleaned_data['phone_no']
            request.session['phone_no'] = phone_no
            request.session['verified'] = 'False'
            # secret = pyotp.random_base32()
            # request.session['secret'] = secret
            request.session.save()
            logger.info("phone_no is saved into session")
        else:
            return HttpResponseUnprocessableEntity("invalid phone number")
        
        user = User.objects.filter(phone_no=phone_no).first()
        
        if user: #user does exist
            #goto login form
            return render(request, 'registration/login.html',{
                'phone_no': phone_no
            })
        else: #use does not exist
            
            #totp = pyotp.TOTP(secret, interval=120)
            verification_code = generate_code();
            request.session['verification_code'] = verification_code
            expire = timezone.now() + timezone.timedelta(seconds=120)
            request.session['expire_date'] = expire.strftime('%Y-%m-%d %H:%M:%S.%f')
            request.session.save()
            #send otp via sms
            
            is_sent  = True
            if is_sent:
                return render(request, 'registration/verification.html',
                              {'code':verification_code })
            else:
                return HttpResponseServerError("falid to send sms.")
    
    #request method is get:
    return render(request, 'registration/phone.html')
            
            
def reset_password(request: HttpRequest):
    phone_no = request.session.get('phone_no')
    if not phone_no:
        return HttpResponseBadRequest('malicious attempt!...')
    
    request.session['reset_password'] = 'True'
    #generate code---------------
    verification_code = generate_code();
    request.session['verification_code'] = verification_code
    expire = timezone.now() + timezone.timedelta(seconds=120)
    request.session['expire_date'] = expire.strftime('%Y-%m-%d %H:%M:%S.%f')
    request.session.save()
    #-----------------------------
    #send code via sms
    #-----------------------------
    return render(request, 'registration/verification.html', {'code': verification_code, 'phone_no': phone_no});            

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
            # secret = request.session.get('secret')
            # print(secret)
            # totp  = pyotp.TOTP(secret,interval=120)
            verification_code = request.session.get('verification_code')
            dt = timezone.now().replace(tzinfo=None)
            expire = timezone.datetime.strptime(request.session.get('expire_date'),'%Y-%m-%d %H:%M:%S.%f')
            print(expire,"\n",dt)

            if expire < dt:
                return render(request, 'registration/code_expiration.html')
            
            if not verification_code == code.strip():
                return HttpResponseBadRequest("expired or invalid code")
            ##-------new-------------------------------
            if(request.session.get('reset_password') == 'True'):
                request.session['reset_verified'] = 'True'
            #------------------------------------------
                
            request.session['verified'] = 'True'
            request.session.save()
            user_does_exists = User.objects.filter(phone_no=phone_no).count();
            print(user_does_exists == 1 ,'user exists.....')
            return render(request, 'registration/password.html', {
                "user_does_exists": (user_does_exists == 1)
            })
        else:
            return HttpResponseUnprocessableEntity("invalid code")
    #get
    return HttpResponseNotAllowed(['POST'])
            

def set_password(request:HttpRequest):
    if request.method == 'POST':
        verified = request.session.get('verified')
        if not verified or verified != 'True':
            return HttpResponseBadRequest("unauthenticated attempt")
        
        form = SetPasswordForm(request.POST)
        if form.is_valid():
            phone_no = request.session.get('phone_no')
            if not phone_no:
                return HttpResponseBadRequest("phone no is not set")
            
            password = form.cleaned_data['password']
            user = User.objects.filter(phone_no=phone_no).first()
            reset_verified = request.session.get('reset_verified')
            if not user:
                user = User(phone_no=phone_no)
            else:
                if not reset_verified == 'True':
                    return HttpResponseBadRequest('malicious attempt..!')

                
            user.backend = 'users.CustomAuthenticationBackend.PhoneAuthentication'
            user.set_password(password)
            user.save()
            
            login(request, user)
            del request.session['phone_no']
            del request.session['verified']
            del request.session['reset_verified']

            return redirect('index:home')
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
                return redirect('index:home');
            else:
                return HttpResponseBadRequest("incorrect password...try again")
            
        else:
            return HttpResponseUnprocessableEntity("invalid password")
    return HttpResponseNotAllowed(['POST'])

@login_required
def logout_user(request:HttpRequest):
    logout(request)
    return redirect('index:home')


def dashboard(request:HttpRequest):
    if not request.user.is_authenticated:
        return enrollment(request);
    return render(request,'user/dashboard.html')

@login_required
def profile(request:HttpRequest):
    if request.method ==  'POST':
        profile_form  = ProfileForm(request.POST, instance=request.user)
        print(request.POST.get('state'))

        if profile_form.is_valid():
            address = Address.objects.filter(user=request.user).first()
            if not address:
                address = Address(user=request.user)
            address_form = AddressForm(request.POST, instance=address)
            if address_form.is_valid():
                print('address....')
                
                address_form.save()
            profile_form.save()
        else:
            return HttpResponseUnprocessableEntity(profile_form.errors)
    
    return render(request, 'user/profile.html', {
        'provinces': get_provinces()
    })






