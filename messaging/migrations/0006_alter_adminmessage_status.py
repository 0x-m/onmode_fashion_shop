# Generated by Django 3.2.4 on 2021-11-15 17:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messaging', '0005_alter_adminmessage_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='adminmessage',
            name='status',
            field=models.PositiveIntegerField(choices=[(0, 'unread'), (1, 'read')], default=0, verbose_name='status'),
        ),
    ]
