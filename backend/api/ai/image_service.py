from openai import OpenAI
from django.conf import settings
from django.core.files.base import ContentFile

import base64

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_recipe_image(recipe_title, recipe_description):
    prompt = f"""Generate a professional, appetizing food photography image of: {recipe_title}.

        Description: {recipe_description}

        Style requirements:
        - High-quality food photography
        - Well-lit, professional presentation
        - Appetizing and realistic
        - Restaurant-quality plating
        - No text or labels on the image
        - Clean white or neutral background
        - Focus on the dish"""

    try:
        result = client.images.generate(
            model="gpt-image-1-mini", 
            prompt=prompt,
            size="1024x1024"
        )

        image_base64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)

        filename = f"{recipe_title.replace(' ', '_')[:50]}.png"

        return ContentFile(image_bytes, name=filename)

    except Exception as e:
        print(f"Image generation failed: {str(e)}")
        return None