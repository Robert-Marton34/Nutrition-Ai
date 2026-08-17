from django.db import models
from django.contrib.auth.models import User
from datetime import date


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    date_of_birth = models.DateField(null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    gender = models.CharField(max_length=25, blank=True)

    activity_level = models.CharField(max_length=100, blank=True)
    dietary_preferences = models.CharField(max_length=100, blank=True)
    allergies = models.JSONField(default=list, blank=True)

    fitness_goal = models.CharField(max_length=100, blank=True)
    calorie_goal = models.PositiveIntegerField(null=True, blank=True)
    protein_goal = models.PositiveIntegerField(null=True, blank=True)
    fats_goal = models.PositiveIntegerField(null=True, blank=True)
    carbs_goal = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    #age property
    @property
    def age(self):
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None
    
    #Controls what is shows in Django admin
    def __str__(self):
        return f"{self.user.username} Profile"

class DailyCalories(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="daily_calories")
    date = models.DateField()
    calories_consumed = models.PositiveIntegerField()
    protein_consumed = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    carbs_consumed = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    fats_consumed = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    #A user can only have ONE entry per day.
    class Meta:
        unique_together = ("user", "date")
    
    def __str__(self):
        return f"{self.user.username} - {self.date} ({self.calories_consumed} kcal)"

class Recipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recipe")
    title = models.CharField(max_length=250, blank=True)
    description = models.TextField(blank=True)

    servings = models.PositiveIntegerField()
    total_time_minutes = models.PositiveIntegerField(null=True, blank=True)

    ingredients = models.JSONField(default=list, blank=True)
    instructions = models.JSONField(default=list, blank=True)
    dietary_tag = models.CharField(max_length=100, blank=True)

    calories_per_serving = models.PositiveIntegerField()
    protein_per_serving = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    carbs_per_serving = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    fats_per_serving = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    is_favorite = models.BooleanField(default=False)
    source = models.CharField(max_length=100, blank=True)

    image = models.ImageField(upload_to='recipe_images/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["is_favorite"]),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.created_at})"








