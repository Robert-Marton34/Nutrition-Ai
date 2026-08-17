from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from .serializers import UserSerializer, ProfileSerializer, DailyCaloriesSerializer, RecipeSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Profile, DailyCalories, Recipe
from django.db.models import F
from django.db.models import Prefetch
from .ai.recipe_service import generate_recipe_ai
from .ai.advice_service import generate_nutrition_advice
from .ai.food_scanner_service import analyze_food_image
from .utils.user_summary import get_user_nutrition_summary
from .ai.image_service import generate_recipe_image
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

import base64
import traceback
import json


#USER VIEW
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

#PROFILE VIEW
class ProfileCreateView(generics.CreateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

class ProfileStatusView(generics.GenericAPIView): #Profile Status(if exists)
    permission_classes = [IsAuthenticated]

    #Check if user has attribute Profile
    def get(self, request):
        return Response({
            "has_profile": Profile.objects.filter(user=request.user).exists()
        })
    
#DailyCaloriesView
class DailyCaloriesView(generics.ListCreateAPIView):
    serializer_class = DailyCaloriesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyCalories.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        data = serializer.validated_data

        date = data["date"]
        calories_added = data.get("calories_consumed", 0)
        protein_added = data.get("protein_consumed", 0)
        carbs_added = data.get("carbs_consumed", 0)
        fats_added = data.get("fats_consumed", 0)

        obj, created = DailyCalories.objects.get_or_create(
            user=self.request.user,
            date=date,
            defaults={
                "calories_consumed": calories_added,
                "protein_consumed": protein_added,
                "carbs_consumed": carbs_added,
                "fats_consumed": fats_added,
            }
        )

        if not created:
            obj.calories_consumed = F("calories_consumed") + calories_added
            obj.protein_consumed = F("protein_consumed") + protein_added
            obj.carbs_consumed = F("carbs_consumed") + carbs_added
            obj.fats_consumed = F("fats_consumed") + fats_added
            obj.save()

class DailyCaloriesDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DailyCaloriesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyCalories.objects.filter(user=self.request.user)

#RECIPE VIEWS
class RecipeListCreate(generics.ListCreateAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Recipe.objects.filter(user=self.request.user).select_related('user')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RecipeDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] 

    def get_queryset(self):
        return Recipe.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        ingredients = self.request.data.get('ingredients')
        instructions = self.request.data.get('instructions')
        
        #Parse JSON strings if they exist
        if ingredients and isinstance(ingredients, str):
            ingredients = json.loads(ingredients)
        
        if instructions and isinstance(instructions, str):
            instructions = json.loads(instructions)
        
        #Save with parsed data
        serializer.save(
            ingredients=ingredients if ingredients else serializer.instance.ingredients,
            instructions=instructions if instructions else serializer.instance.instructions
        )
    
#AI VIEWS
class GenerateRecipeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        ingredients = request.data.get("ingredients", [])

        ingredients = [ing.strip() for ing in ingredients if ing and ing.strip()]

        use_preferences = request.data.get("useDietaryPreferences", True)
        use_allergens = request.data.get("useAllergens", True)
        match_calorie_goal = request.data.get("matchCalorieGoal", True)

        profile = Profile.objects.filter(user=request.user).first()

        dietary_preferences = None
        allergies = None
        calorie_goal = None


        if use_preferences:
            dietary_preferences = profile.dietary_preferences

        if use_allergens:
            allergies = profile.allergies

        if match_calorie_goal and profile.calorie_goal:
            calorie_goal = profile.calorie_goal / 3

        ai_recipe = generate_recipe_ai(
            ingredients,
            dietary_preferences,
            allergies,
            calorie_goal
        )

        image_file = None
        try:
            image_file = generate_recipe_image(ai_recipe.title, ai_recipe.description)
        except Exception as e:
            print(f"Image generation failed: {str(e)}")

        recipe = Recipe.objects.create(
            user=request.user,
            title=ai_recipe.title,
            description=ai_recipe.description,

            servings=ai_recipe.servings,
            total_time_minutes=ai_recipe.total_time_minutes,

            ingredients=ai_recipe.ingredients,
            instructions=ai_recipe.instructions,

            calories_per_serving=ai_recipe.calories_per_serving,
            protein_per_serving=ai_recipe.protein_per_serving,
            carbs_per_serving=ai_recipe.carbs_per_serving,
            fats_per_serving=ai_recipe.fats_per_serving,

            source="ai",
            is_favorite=False
        )

        if image_file:
            recipe.image.save(
                f"ai_{recipe.id}.jpg",  #Filename
                image_file,  #File content
                save=True  #Save the model
            )

        serializer = RecipeSerializer(recipe)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class NutritionAdviceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        try:
            profile = user.profile
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)

        summary = get_user_nutrition_summary(user)

        advice = generate_nutrition_advice(profile, summary)

        return Response({
            "summary": advice.summary,
            "advice": advice.advice,
            "stats": summary
        })
    
class AnalyzeFoodImageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            image = request.FILES.get("image")
            description = request.data.get("description", "")

            if not image:
                return Response({"error": "Image is required"}, status=400)

            #Remove base64 prefix if exists
            image_data = base64.b64encode(image.read()).decode('utf-8')

            result = analyze_food_image(image_data, description)

            return Response(result, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(" ERROR:", str(e))
            traceback.print_exc()

            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )