# Generated by Django 3.2.4 on 2021-06-30 05:19

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0004_type_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shop',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2021, 6, 30, 5, 19, 58, 595730, tzinfo=utc)),
        ),
    ]
