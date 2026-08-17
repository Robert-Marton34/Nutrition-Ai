from google import genai
from google.genai import types
from django.conf import settings
from .ai_models import FoodAnalysis

import base64
import json
import tempfile
import os


client = genai.Client(api_key=settings.GEMINI_API_KEY)

def analyze_food_image(image_base64, user_description=""): 
    prompt = f"""You are a professional nutritionist analyzing a food image.

    USER DESCRIPTION: {user_description if user_description else "No description provided"}

    Analyze this food image and provide accurate nutritional estimates.

    IMPORTANT INSTRUCTIONS:
    1. Identify all visible foods and estimate portion sizes
    2. Calculate total nutritional values for the ENTIRE meal/food shown
    3. Be realistic and conservative in estimates
    4. If multiple items are visible, sum them all together
    5. Consider cooking methods (fried = more calories, grilled = less)

    Return ONLY a valid JSON object with this structure:
    {{
    "food_name": "Brief name of the food(s)",
    "description": "Detailed description of what you see (2-3 sentences)",
    "portion_size": "Estimated portion (e.g., '1 plate', '2 cups', '350g')",
    "confidence": "high/medium/low",
    "calories": integer (total calories for entire portion shown),
    "protein": float (grams, one decimal),
    "carbs": float (grams, one decimal),
    "fats": float (grams, one decimal),
    "ingredients": ["item 1", "item 2", "item 3"],
    "notes": "Any important observations or assumptions made"
    }}

    Generate the analysis now:"""

    temp_file_path = None

    try:
        #Upload image to Gemini
        image_bytes = base64.b64decode(image_base64)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(image_bytes)
            temp_file_path = temp_file.name

        uploaded_file = client.files.upload(
            file=temp_file_path,
            config=types.UploadFileConfig(
                mime_type="image/jpeg",
            )
        )
        
        #Generate content with image and prompt
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_uri(
                            file_uri=uploaded_file.uri,
                            mime_type=uploaded_file.mime_type,
                        ),
                        types.Part.from_text(text=prompt),
                    ],
                ),
            ],
            config=types.GenerateContentConfig(
                temperature=0.4, 
                response_mime_type="application/json",
            )
        )
        
        #Parse JSON response
        result = json.loads(response.text)

        
        #Validate required fields
        scan = FoodAnalysis(**result)
        return scan
        
    except Exception as e:
        raise Exception(f"Food analysis failed: {str(e)}")
    
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)