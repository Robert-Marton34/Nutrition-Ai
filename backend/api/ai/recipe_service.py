from google import genai
from google.genai import types
from django.conf import settings
from .ai_models import AIRecipe

import json


client = genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_recipe_ai(ingredients, dietary_preferences=None, allergies=None, calorie_goal=None):
    if not ingredients:
        raise ValueError("Ingredients list cannot be empty")
    
    system_prompt = """
        You are a professional nutritionist and chef.

        Generate a healthy recipe using the provided ingredients.

        Rules:
        - Use the provided ingredients as the main components
        - Respect dietary preferences (vegetarian, vegan, keto, etc.)
        - NEVER use ingredients that match the allergen list
        - Target the requested calories per serving (within ±50 calories)
        - Keep instructions clear and simple


        Nutrition guidelines:
        - Protein should be at least 25g per serving if possible
        - Provide balanced macros (protein, carbs, fats)
        - Maximum 10 ingredients total
        - 4-8 step instructions

        Return a complete, structured recipe with accurate nutrition data."""

    user_prompt = f"""
        Available ingredients:
        {", ".join(ingredients)}

        Dietary preference:
        {dietary_preferences or "None"}

        Avoid allergens:
        {", ".join(allergies) if allergies else "None"}

        Target calories per serving:
        {round(calorie_goal) if calorie_goal else "Any"}

        Generate a complete recipe now.

        IMPORTANT: Return ONLY a valid JSON object with this exact structure:
        {{
        "title": "Recipe Name",
        "description": "Brief description",
        "servings": 4,
        "total_time_minutes": 30,
        "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
        "instructions": ["Step 1", "Step 2"],
        "calories_per_serving": 450,
        "protein_per_serving": 35.5,
        "carbs_per_serving": 40.2,
        "fats_per_serving": 12.8
        }}

        Do not include any text before or after the JSON.
        """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=user_prompt,
        config=types.GenerateContentConfig(
            temperature=0.8,
            response_mime_type="application/json",
            system_instruction=system_prompt,
        )
    )

    recipe_json = json.loads(response.text)
        
    recipe = AIRecipe(**recipe_json)
        
    return recipe