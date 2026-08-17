import json

from google import genai
from google.genai import types
from django.conf import settings
from .ai_models import AINutritionAdvice


client = genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_nutrition_advice(profile, summary):
    system_prompt = """
        You are an expert nutrition coach.

        Analyze the user's eating habits and give actionable advice.

        Rules:
        - Be specific and personalized
        - Keep it short (3-5 bullet points)
        - Focus on improvements
        - Consider user's goal (weight loss, gain, maintenance)
        - Consider macro balance
        """

    user_prompt = f"""
        User profile:
        - Goal: {profile.fitness_goal}
        - Calorie goal: {profile.calorie_goal}
        - Protein goal: {profile.protein_goal}
        - Dietary preference: {profile.dietary_preferences}

        Last 7 days averages:
        - Calories: {summary['avg_calories']}
        - Protein: {summary['avg_protein']}
        - Carbs: {summary['avg_carbs']}
        - Fats: {summary['avg_fats']}

        Days tracked: {summary['days_tracked']}

        Give personalized advice.
        Return JSON:

        {{
        "summary": "1 sentence overall progress",
        "advice": ["tip1", "tip2", "tip3"]
        }}
        """

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=user_prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            response_mime_type="application/json",
            system_instruction=system_prompt,
        )
    )

    data = json.loads(response.text)

    advice = AINutritionAdvice(**data)

    return advice


