# Generated by Django 3.2.4 on 2021-10-16 15:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0004_alter_category_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='attrs',
            field=models.CharField(blank=True, max_length=2000, null=True, verbose_name='attributes'),
        ),
    ]
