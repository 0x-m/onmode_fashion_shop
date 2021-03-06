# Generated by Django 3.1.7 on 2021-07-06 17:55

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('coupons', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Date Created')),
                ('total_price', models.DecimalField(decimal_places=0, default=0, max_digits=10, verbose_name='Total Price')),
                ('discounted_total_price', models.DecimalField(decimal_places=0, default=0, max_digits=10, verbose_name='Discounted total price')),
                ('tracking_code', models.CharField(max_length=30, verbose_name='Tracking code')),
                ('state', models.CharField(choices=[('pending', 'pending'), ('accept', 'accept'), ('rejected', 'rejected'), ('sent', 'sent'), ('received', 'recieved'), ('cancelled', 'cancelled'), ('returned', 'returned')], default='pending', max_length=20, verbose_name='State')),
                ('verify_sent', models.BooleanField(default=False, verbose_name='Verify sent')),
            ],
            options={
                'verbose_name': 'Order',
                'verbose_name_plural': 'Orders',
            },
        ),
        migrations.CreateModel(
            name='OrderAddress',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=50, verbose_name='First name')),
                ('last_name', models.CharField(max_length=50, verbose_name='Last name')),
                ('phone_no', models.CharField(max_length=11, verbose_name='Phone Number')),
                ('state', models.CharField(max_length=50, verbose_name='State')),
                ('city', models.CharField(max_length=50, verbose_name='City')),
                ('town', models.CharField(max_length=50, verbose_name='town')),
                ('postal_code', models.CharField(max_length=50, null=True, verbose_name='Postal Code')),
                ('description', models.CharField(max_length=500, verbose_name='Description')),
            ],
            options={
                'verbose_name': 'Order Address',
                'verbose_name_plural': 'Order Adresses',
            },
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField(verbose_name='Quantity')),
                ('price', models.DecimalField(decimal_places=0, default=0, max_digits=10, verbose_name='Price')),
                ('has_discount', models.BooleanField(default=False, verbose_name='Has discount')),
                ('discounted_price', models.DecimalField(decimal_places=0, default=0, max_digits=10, verbose_name='Discounted Price')),
                ('total_price', models.DecimalField(decimal_places=0, default=0, max_digits=10, verbose_name='Total price')),
                ('discounted_total_price', models.DecimalField(decimal_places=0, default=0, max_digits=10, verbose_name='Discounted total price')),
            ],
            options={
                'verbose_name': 'Order Item',
                'verbose_name_plural': 'Order Items',
            },
        ),
        migrations.CreateModel(
            name='OrderList',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Date created')),
                ('total_price', models.DecimalField(decimal_places=0, default=0, max_digits=10, verbose_name='Total price')),
                ('total_price_after_discount', models.DecimalField(decimal_places=0, default=0, max_digits=10, verbose_name='Discounted Total Price')),
                ('total_price_after_applying_coupon', models.DecimalField(decimal_places=0, default=0, max_digits=10, verbose_name='Total price after applying coupon')),
                ('is_paid', models.BooleanField(default=False, verbose_name='Paid')),
                ('use_default_address', models.BooleanField(default=True, verbose_name='Use default address')),
                ('post_method', models.CharField(choices=[('ultimate', 'ultimate'), ('express', 'express'), ('normal', 'normal'), ('local', 'Local')], default='ultimate', max_length=20, verbose_name='Post Method')),
                ('Address', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='orders.orderaddress', verbose_name='Address')),
                ('coupon', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='coupons.coupon', verbose_name='Coupon')),
            ],
            options={
                'verbose_name': 'Order List',
                'verbose_name_plural': 'Order Lists',
            },
        ),
    ]
