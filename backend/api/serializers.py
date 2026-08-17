from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile, DailyCalories, Recipe


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email" ,"password"]
        extra_kwargs = {"password": {"write_only": True},
                        "email": {"required": True}, } #Security
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data) #hashes password, sets username/email, prepares authentication
        return user

class ProfileSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()  # @property age from model

    class Meta:
        model = Profile
        fields = ["user", "date_of_birth", "age", "height", "weight", "gender", 
                  "activity_level", "dietary_preferences", "allergies",
                  "fitness_goal", "calorie_goal", "protein_goal", "fats_goal", "carbs_goal",
                  "created_at", "updated_at"]
        extra_kwargs = {"user": {"read_only": True}} #assigns logged-in user

    def create(self, validated_data):
        user = self.context["request"].user

        #if Profile.objects.filter(user=user).exists():
        if hasattr(user, "profile"):
            raise serializers.ValidationError("Profile already exists.")

        return Profile.objects.create(user=user, **validated_data) #creates profile for logged-in user, submitted fields.

    
class DailyCaloriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCalories
        fields = ["user", "date", "calories_consumed", "protein_consumed", "carbs_consumed", "fats_consumed"]
        extra_kwargs = {"user": {"read_only": True},            
            "calories_consumed": {"required": False},
            "protein_consumed": {"required": False},
            "carbs_consumed": {"required": False},
            "fats_consumed": {"required": False},
        } #assigns logged-in user

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ["id", "user", "title", "description",
                  "servings", "total_time_minutes",
                  "ingredients", "instructions", "dietary_tag",
                  "calories_per_serving", "protein_per_serving", "carbs_per_serving", "fats_per_serving",
                  "is_favorite", "source",
                  "image",
                  "created_at", "updated_at"] 
        extra_kwargs = {"user": {"read_only": True}} #assigns logged-in user
