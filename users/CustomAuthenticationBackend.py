from types import MappingProxyType
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import  make_password, check_password
from .models import User
import logging

logger = logging.getLogger(__name__)
# formatter = logging.Formatter('%(name)s %(levelname)s %(message)s')
# f_hand =  logging.FileHandler('logs/authentication.log','w')
# f_hand.setFormatter(formatter)
# logger.addHandler(f_hand)
# logger.setLevel('DEBUG')
#-------------------------------------------------------------------

class PhoneAuthentication(BaseBackend):
    def authenticate(self, request, phone_no, password):
        print('authentiaca....')
        logger.info('authenticating....')
        u = User.objects.filter(phone_no=phone_no).first()
        if u:
            logger.info('checking password')
            logger.critical('user password is :%s ', u.password)
            logger.critical('entered password is %s', password)
            if check_password(password,u.password):
                logger.info('passwor is correct!')
                return u
            logger.critical('authentication faild due to invalid password')
        return None

        
        
    def get_user(self, user_id: int):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
    