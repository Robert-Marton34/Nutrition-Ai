from django.contrib import admin
from .models import Profile, DailyCalories, Recipe  


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", 
                    "age", "height", "weight", "gender",
                    "activity_level", "dietary_preferences", "allergies",
                    "fitness_goal", "calorie_goal", "protein_goal", "fats_goal", "carbs_goal",
                    "created_at", "updated_at")
    search_fields = ("user__username",)

@admin.register(DailyCalories)
class DailyCaloriesAdmin(admin.ModelAdmin):
    list_display = ("user", "date", 
                    "calories_consumed", "protein_consumed", "carbs_consumed", "fats_consumed")
    search_fields = ("user__username",)
    list_filter = ("date",)
    ordering = ("-date",)
    list_select_related = ("user",)

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "description",
                    "servings", "total_time_minutes",
                    "ingredients", "instructions", "dietary_tag",
                    "calories_per_serving", "protein_per_serving", "carbs_per_serving", "fats_per_serving",
                    "is_favorite", "source",
                    "created_at", "updated_at")
    search_fields = ("title", "user__username")
    list_filter = ("created_at", "is_favorite", "source")
    ordering = ("-created_at",)
    list_select_related = ("user",)
