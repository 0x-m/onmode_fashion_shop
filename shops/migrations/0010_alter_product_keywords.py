# Generated by Django 3.2.4 on 2021-07-13 13:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0009_auto_20210712_2354'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='keywords',
            field=models.CharField(max_length=200, null=True, verbose_name='Keywords'),
        ),
    ]
