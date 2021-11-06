
from product_attributes.models import Color, Size
from shops.models import Product
from django.http import HttpRequest
from django.conf import settings
from coupons.models import Coupon
import logging
from orders.models import Order,OrderAddress, OrderList, OrderItem

#-----------------------------------------------
logger = logging.getLogger(__name__)
# logger.setLevel("INFO")
# f_handler = logging.FileHandler('logs/cart.log','w')
# fmt = logging.Formatter("%(name)s -- %(levelname)s -- %(msg)s -- %(lineno)d")
# f_handler.setFormatter(fmt)
# logger.addHandler(f_handler)
#------------------------------------------------

class Cart():
    def __init__(self,request:HttpRequest) -> None:
        logger.info('session for cart started....')
        self.session = request.session
        
        cart = self.session.get(settings.CART_SESSION_ID)
        if not cart:
            logger.info('cart session not found...initiate a new session record')
            cart = self.session[settings.CART_SESSION_ID] = {} #initialize with empty
        self.cart = cart
        self.coupon_id = self.session.get('coupon_id')
        logger.info('coupon issued...coupon: %s' % self.coupon_id)
        
    @property
    def coupon(self):
        if self.coupon_id:
            coupon = Coupon.objects.filter(id=self.coupon_id).first()
            if coupon.is_valid():
                return coupon
        return None
    
    @property
    def is_empty(self):
        logger.info("cart is empty? %s" % (self.cart == {}) )
        return  self.cart == {}

    def add(self,product_id, quantity=1):
        logger.info('add product with id:%s to cart' % product_id)
        id = str(product_id)
        if id not in self.cart.keys():
            logger.info('product with id:%s added to the cart..quantity: %s' % (product_id,quantity))
            
            self.cart[id] = {
                'quantity': quantity,
            } 
            self.save()
            logger.info("session saved...product with %s and q:%s" % (product_id, self.cart[id]['quantity']))
        else:
            self.cart[id] = {
                'quantity': int(self.cart[id]['quantity']) + 1
            }
    
    def choose_color(self, product_id, color, color_id):
        print('change color...');
        logger.info('change color issued for product: %s' % product_id)
        id = str(product_id)
        if id in self.cart.keys():
            logger.info('prev color is  ...color changed...')
            self.cart[id]['color'] = color
            self.cart[id]['color_id'] = color_id
            self.save()
            logger.info('selected color is : %s' % self.cart[id]['color'])
            
    def choose_size(self, product_id, size, size_id):
        logger.info('change size issued... product: %s' % product_id)
        id = str(product_id)
        if id in self.cart.keys():
            self.cart[id]['size'] = size
            self.cart[id]['size_id'] = size_id
            self.save()
            logger.info('new size in session is %s' % self.cart[id]['size'])
             
    def remove(self, product_id):
        logger.info('remove product is issuded')
        id = str(product_id)
        if id in self.cart:
            logger.info('product with id:%s is reomved' % product_id)
            del self.cart[id]
            self.save()
            return True
        return False
    
    
    def increment(self, product_id):
        logger.info('quantity increment is issued...product:%s' % product_id)
        id = str(product_id)
        if id in self.cart:
            q = Product.objects.filter(id=product_id).first().quantity;
            desired_q = int(self.cart[id]['quantity'])
            if ( desired_q +1 <= q):
                self.cart[id]['quantity'] +=1
                self.save()
                logger.info('icremented successfuclly')
                return True
        logger.warning('increment for product:%s was failed' % id)
        return False
        
    
    def decrement(self, product_id):
        logger.info('decrement for product %s is issued...' % product_id)
        id = str(product_id)
       
        if id in self.cart:
            quantity = int(self.cart[id]['quantity'])
            if quantity > 1:
                self.cart[id]['quantity'] = quantity - 1
                self.save()
                logger.info('successfully decrement...')
                return True
        logger.warning('decrement for product %s was failed' % id)
        return False

    def clear(self):
        del self.session[settings.CART_SESSION_ID]
        self.cart = {}
        logger.info('cart is cleared...')
        self.save()
        print('clear cart-------------------------')
    
    def get_total_price(self):
        logger.info('compute total issued...')
        total = 0
        logger.info(self.cart.keys())
        products = Product.objects.filter(id__in=self.cart.keys())
        logger.info('nubmber of products is %s' % len(products))
        
        for product in products:
            total += self.__get_total_price_per_item(product)
        coupon = self.coupon
        if coupon:
            if coupon.is_valid():
                total = self.coupon.get_price_after_applying_coupon(total)
        logger.info('total price is : %s coupon: %s' % (total, coupon))
        return total
    
    def __get_total_price_per_item(self, product:Product):
        logger.info('compute total price for product:%s is issued...' % product.id)
        quantity = self.cart[str(product.id)]['quantity']
        price = product.price
        logger.info('qunatity for product:%s  is %s price is %s' % (product.id, quantity, price))
        discount = product.discounts.last()
        logger.info('valid discount for product:%s is %s'% (product.id, discount))

        if discount:
            if discount.is_valid():
              price = discount.get_discounted_price()
        print('price:', price)
        print('quan', quantity)
        logger.info('--total price for product:%s is %s' % (product.id, price *  int(quantity)))
        return price * int(quantity)
    
    def apply_coupon(self, coupon:Coupon):
        logger.info('apply coupon is issued..')
        if not self.coupon_id:
            
            self.session['coupon_id'] = coupon.id
            self.coupon_id = coupon.id
            self.save()
            logger.info('coupon is set..')
    
    def make_orders(self,user, order_address: OrderAddress=None):
        print('make orders-----------------------')
        orders = {}
        order_list = OrderList(user=user)
        order_list.save()
        if not order_address:
            order_list.use_default_address = True
        else:
            order_list.Address = order_address
            
        for item in self: 
            product = item['product']
            shop = product.shop
            size = 0
            color = 0
            if item['size_id']:
                size_id = int(item['size_id'])
                size = Size.objects.filter(id=size_id).first()
            if item['color_id']:
                color_id = int(item['color_id'])
                color = Color.objects.filter(id=color_id).first()
       
            quantity = item['quantity']
            if shop.id not in orders.keys():
                orders[shop.id] = Order(user=user,shop=shop,order_list=order_list)
                orders[shop.id].save()
                
            order_item  = OrderItem(
                order=orders[shop.id],
                product=product,
                quantity=quantity,
                size = size,
                color = color,
                price= item['price']
            )
            
            order_item.save()
            orders[shop.id].save() #to compute price
            
        order_list.save() #to compute price
        if self.coupon:
            order_list.coupon = self.coupon
        
        order_list.finish()

    
    def checkout(self):
        #-------create orders------------
        if self.coupon:
            self.coupon.make_used()
        if self.session.get('coupon_id'):
            del self.session['coupon_id']
        self.clear()
        self.save()
    
    
    def save(self):
        self.session.modified = True
        self.session.save()
        
        
    #------------helpers-----------------
    def encode_colors(self, product: Product):
        colors = product.colors.all();
        code:str = ''
        for color in colors:
            code += f'{color.id}:{color.name}:{color.code},'

        return code[:len(code) - 1]
        
    
    def encode_sizes(self, product: Product):
        sizes = product.sizes.all()
        code:str = ''
        for size in sizes:
            code += f'{size.id}:{size.code},'
        return code[:len(code) - 1]
    
    
    def check_for_valid_discount(self,product: Product):
        disc =  product.discounts.all().last()
        print (type(disc))
        if disc:
            if disc.is_valid():
                return True
        return False
    
    def __iter__(self):
        product_ids = self.cart.keys()
        products = Product.objects.filter(id__in =product_ids)
        cart = self.cart.copy()
        for product in products:
            id = str(product.id)
            cart[id]['product'] = product
            cart[id]['price'] = product.price
            cart[id]['discounted_price'] = self.__get_total_price_per_item(product)
            cart[id]['total'] = cart[id]['discounted_price'] * int(cart[id]['quantity'])
            cart[id]['is_available'] = product.is_available()
            cart[id]['colors'] = self.encode_colors(product)
            cart[id]['sizes'] = self.encode_sizes(product)
            cart[id]['has_valid_discount'] = self.check_for_valid_discount(product)
            yield cart[id]
    
    def __len__(self):
        num = 0
        if self.cart:
            num = sum(int(item['quantity']) for item in self.cart.values())
        print("cart", num)
        print(self.cart.keys())
        return num
