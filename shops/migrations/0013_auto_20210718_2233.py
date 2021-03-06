# Generated by Django 3.2.4 on 2021-07-18 18:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('product_attributes', '0002_auto_20210710_1107'),
        ('shops', '0012_remove_product_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='brand',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='shops.brand', verbose_name='Brand'),
        ),
        migrations.AlterField(
            model_name='product',
            name='categories',
            field=models.ManyToManyField(null=True, related_name='products', to='shops.Category', verbose_name='Categories'),
        ),
        migrations.AlterField(
            model_name='product',
            name='colors',
            field=models.ManyToManyField(null=True, related_name='products', to='product_attributes.Color', verbose_name='Colors'),
        ),
        migrations.AlterField(
            model_name='product',
            name='name',
            field=models.CharField(blank=True, max_length=120, null=True, verbose_name='Name'),
        ),
        migrations.AlterField(
            model_name='product',
            name='sizes',
            field=models.ManyToManyField(null=True, related_name='products', to='product_attributes.Size', verbose_name='Sizes'),
        ),
        migrations.AlterField(
            model_name='product',
            name='subtype',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='products', to='shops.subtype', verbose_name='SubType'),
        ),
        migrations.AlterField(
            model_name='product',
            name='type',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='shops.type', verbose_name='Type'),
        ),
    ]
