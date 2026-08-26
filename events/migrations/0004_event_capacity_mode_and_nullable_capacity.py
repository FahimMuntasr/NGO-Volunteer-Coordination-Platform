from django.core.validators import MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0003_event_coordinator"),
    ]

    operations = [
        migrations.AddField(
            model_name="event",
            name="capacity_mode",
            field=models.CharField(
                choices=[("FIXED", "Fixed capacity"), ("UNLIMITED", "Unlimited")],
                default="FIXED",
                max_length=10,
            ),
        ),
        migrations.AlterField(
            model_name="event",
            name="volunteer_capacity",
            field=models.PositiveIntegerField(
                blank=True,
                null=True,
                validators=[MinValueValidator(1)],
            ),
        ),
    ]
