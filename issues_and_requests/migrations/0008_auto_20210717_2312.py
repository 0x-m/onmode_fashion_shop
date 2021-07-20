# Generated by Django 3.2.4 on 2021-07-17 18:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('issues_and_requests', '0007_remove_issue_help'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='issue',
            name='status',
        ),
        migrations.AddField(
            model_name='issue',
            name='response',
            field=models.CharField(blank=True, max_length=5000, null=True, verbose_name='Response'),
        ),
    ]