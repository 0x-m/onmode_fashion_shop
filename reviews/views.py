from typing import ChainMap
from django.core.paginator import Paginator
from django.db.models.query_utils import PathInfo
from django.http.response import HttpResponse, HttpResponseBase, HttpResponseNotAllowed
from reviews.forms import CommentForm
from django.contrib.auth import login
from django.shortcuts import render
from django.http import HttpRequest,HttpResponseBadRequest
from django.contrib.auth.decorators import login_required, user_passes_test
from shops.models import Product
from .models import Comment

def get_product_comments(request:HttpRequest, product_id):
    comments = Comment.objects.filter(product__id=product_id)
    d = HttpResponse('')

    if comments:
        paginator = Paginator(comments,20)
        page = request.GET('pg')
        if not page:
            return HttpResponse("page is not provided")
        return render(request,'review/comments.html',{
            'comments': paginator.page(page)
        })
        
    

@login_required
def leave_comment(request:HttpRequest, product_id):
    product = Product.objects.filter(id=product_id).first()
    if not product:
        return HttpResponseBadRequest('product was not found!')
    
    if request.method == 'POST':
        form = CommentForm(request.POST)
        print(request.POST)
        if form.is_valid():
            body = form.cleaned_data['comment_body']
            try:
                comment = Comment.objects.get(user=request.user, product=product)
                comment.body = body
                comment.save()
            except Comment.DoesNotExist:
                comment = Comment(user=request.user,product=product, body=body)
                comment.save()

            return HttpResponse("successfully registered")
        else:
            print(form.errors)
            return HttpResponseBadRequest('Invalid inputs...')
    return HttpResponseNotAllowed(['POST'])
        
@login_required
def remove_comment(request:HttpRequest,comment_id):
    
    try:
        comment = Comment.objects.get(id=comment_id)
        if not comment.user == request.user:
            return HttpResponseBadRequest('you are not allowed....')
        comment.delete()
    except:
        return HttpResponseBadRequest('comment was not found..!')

