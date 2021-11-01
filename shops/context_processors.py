from .models import Category, Type, SubType

def ProductContextProcessors(request):
    return {
        'categories': Category.objects.all().order_by('-id')
    }