from datetime import timedelta, date
from django.db.models import Avg


def get_user_nutrition_summary(user):
    today = date.today()
    last_7_days = today - timedelta(days=7)

    entries = user.daily_calories.filter(date__gte=last_7_days)

    return {
        "avg_calories": entries.aggregate(Avg("calories_consumed"))["calories_consumed__avg"] or 0,
        "avg_protein": entries.aggregate(Avg("protein_consumed"))["protein_consumed__avg"] or 0,
        "avg_carbs": entries.aggregate(Avg("carbs_consumed"))["carbs_consumed__avg"] or 0,
        "avg_fats": entries.aggregate(Avg("fats_consumed"))["fats_consumed__avg"] or 0,
        "days_tracked": entries.count()
    }