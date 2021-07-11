
from cart.cart import Cart
def CartContextProcessor(request):
    return {
        'cart': Cart(request)
    }