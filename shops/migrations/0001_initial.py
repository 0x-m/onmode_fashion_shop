# Generated by Django 3.1.7 on 2021-07-06 17:55

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import shops.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Brand',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=40, unique=True, verbose_name='Name')),
                ('slug', models.SlugField()),
                ('logo', models.ImageField(blank=True, null=True, upload_to='', verbose_name='Logo')),
                ('is_active', models.BooleanField(default=True, verbose_name='Active')),
            ],
            options={
                'verbose_name': 'Brand',
                'verbose_name_plural': 'Brands',
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=40, unique=True, verbose_name='Name')),
                ('description', models.CharField(max_length=500, null=True, verbose_name='Description')),
                ('slug', models.SlugField()),
                ('is_active', models.BooleanField(default=True, verbose_name='Active')),
                ('image', models.ImageField(blank=True, null=True, upload_to='', verbose_name='Image')),
            ],
            options={
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120, verbose_name='Name')),
                ('description', models.CharField(max_length=500, verbose_name='Description')),
                ('price', models.DecimalField(decimal_places=3, max_digits=10, verbose_name='Price')),
                ('is_available', models.BooleanField(default=True, verbose_name='Available')),
                ('date_created', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Date created')),
                ('last_update', models.DateTimeField(auto_now=True, null=True)),
                ('quantity', models.PositiveIntegerField(default=0, verbose_name='Quantity')),
                ('keywords', models.CharField(max_length=2000, null=True, verbose_name='Keywords')),
                ('image', models.ImageField(blank=True, null=True, upload_to='', verbose_name='Image')),
                ('attrs', models.JSONField(null=True)),
            ],
            options={
                'verbose_name': 'Product',
                'verbose_name_plural': 'Products',
            },
        ),
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to=shops.models.ProductImage.generate_path)),
            ],
        ),
        migrations.CreateModel(
            name='Shop',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=40, unique=True, verbose_name='Name')),
                ('description', models.CharField(blank=True, max_length=500, verbose_name='Description')),
                ('address', models.CharField(blank=True, max_length=500, verbose_name='Address')),
                ('logo', models.ImageField(blank=True, null=True, upload_to='', verbose_name='Logo')),
                ('banner', models.ImageField(blank=True, null=True, upload_to='', verbose_name='Banner')),
                ('is_active', models.BooleanField(default=True, verbose_name='active')),
                ('date_created', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Date created')),
                ('post_destinatinos', models.JSONField(null=True, verbose_name='Postal Destinations')),
            ],
            options={
                'verbose_name': 'Shop',
                'verbose_name_plural': 'Shops',
            },
        ),
        migrations.CreateModel(
            name='Type',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=50, unique=True, verbose_name='Name')),
                ('description', models.CharField(blank=True, max_length=500, null=True, verbose_name='Description')),
                ('is_active', models.BooleanField(default=True, verbose_name='Active')),
                ('atrrs', models.JSONField(blank=True, null=True, verbose_name='Attributes')),
                ('categories', models.ManyToManyField(related_name='types', to='shops.Category', verbose_name='Categories')),
            ],
            options={
                'verbose_name': 'Type',
                'verbose_name_plural': 'Types',
            },
        ),
        migrations.CreateModel(
            name='SubType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Name')),
                ('type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subtypes', to='shops.type', verbose_name='Type')),
            ],
            options={
                'verbose_name': 'SubType',
                'verbose_name_plural': 'SubTypes',
            },
        ),
    ]
