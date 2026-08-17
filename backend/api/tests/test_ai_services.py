from django.test import TestCase
from unittest.mock import patch, MagicMock
from api.ai.recipe_service import generate_recipe_ai
from api.ai.food_scanner_service import analyze_food_image
from api.ai.advice_service import generate_nutrition_advice


class RecipeAIServiceTest(TestCase):
    
    @patch('api.ai.recipe_service.client.models.generate_content')
    def test_generate_recipe_success(self, mock_generate):
        #Test successful AI recipe generation
        mock_response = MagicMock()
        mock_response.text = '''{
            "title": "Chicken Rice Bowl",
            "description": "A healthy and balanced meal",
            "servings": 4,
            "total_time_minutes": 30,
            "ingredients": ["chicken breast", "rice", "vegetables"],
            "instructions": ["Cook rice", "Grill chicken", "Combine"],
            "calories_per_serving": 450,
            "protein_per_serving": 35.0,
            "carbs_per_serving": 45.0,
            "fats_per_serving": 12.0
        }'''
        mock_generate.return_value = mock_response
        
        result = generate_recipe_ai(
            ingredients=['chicken', 'rice'],
            dietary_preferences='none',
            allergies=None,
            calorie_goal=450
        )
        
        self.assertEqual(result.title, 'Chicken Rice Bowl')
        self.assertEqual(result.servings, 4)
        self.assertEqual(result.calories_per_serving, 450)
        self.assertIn('chicken breast', result.ingredients)

    @patch('api.ai.recipe_service.client.models.generate_content')
    def test_generate_recipe_respects_allergies(self, mock_generate):
        #Test recipe generation avoids allergens
        mock_response = MagicMock()
        mock_response.text = '''{
            "title": "Vegetable Stir Fry",
            "description": "Healthy veggie dish",
            "servings": 2,
            "total_time_minutes": 20,
            "ingredients": ["broccoli", "carrots", "tofu"],
            "instructions": ["Chop vegetables", "Heat pan", "Stir fry"],
            "calories_per_serving": 300,
            "protein_per_serving": 15.0,
            "carbs_per_serving": 35.0,
            "fats_per_serving": 8.0
        }'''
        mock_generate.return_value = mock_response
        
        result = generate_recipe_ai(
            ingredients=['vegetables', 'tofu'],
            allergies=['peanuts', 'shellfish']
        )
        
        #Check no allergens in ingredients
        ingredients_str = ' '.join(result.ingredients).lower()
        self.assertNotIn('peanut', ingredients_str)
        self.assertNotIn('shellfish', ingredients_str)

    def test_generate_recipe_empty_ingredients(self):
        #Test error handling for empty ingredients
        with self.assertRaises(ValueError):
            generate_recipe_ai(ingredients=[])


class FoodScannerServiceTest(TestCase):
    
    @patch('api.ai.food_scanner_service.client.files.upload')
    @patch('api.ai.food_scanner_service.client.models.generate_content')
    def test_analyze_food_image_success(self, mock_generate, mock_upload):
        #Test successful food image analysis
        mock_file = MagicMock()
        mock_file.uri = 'test-uri'
        mock_file.mime_type = 'image/jpeg'
        mock_upload.return_value = mock_file

        mock_response = MagicMock()
        mock_response.text = '''{
            "food_name": "Grilled Chicken Salad",
            "description": "A healthy salad with grilled chicken",
            "portion_size": "1 large bowl",
            "confidence": "high",
            "calories": 350,
            "protein": 35.5,
            "carbs": 25.0,
            "fats": 12.0,
            "ingredients": ["chicken", "lettuce", "tomato"],
            "notes": "Well-balanced meal"
        }'''
        mock_generate.return_value = mock_response
        
        result = analyze_food_image(
            image_base64='ZmFrZV9iYXNlNjQ=',
            user_description='chicken salad'
        )
        
        self.assertEqual(result.food_name, 'Grilled Chicken Salad')
        self.assertEqual(result.calories, 350)
        self.assertEqual(result.confidence, 'high')
        self.assertIn('chicken', result.ingredients)

class NutritionAdviceServiceTest(TestCase):

    @patch('api.ai.advice_service.client.models.generate_content')
    def test_generate_nutrition_advice_success(self, mock_generate):
        #Test successful nutrition advice generation

        mock_response = MagicMock()
        mock_response.text = '''{
            "summary": "You are doing well but need more protein.",
            "advice": [
                "Increase lean protein intake",
                "Reduce processed carbs",
                "Add more vegetables"
            ]
        }'''
        mock_generate.return_value = mock_response

        class MockProfile:
            fitness_goal = "muscle_gain"
            calorie_goal = 2500
            protein_goal = 150
            dietary_preferences = "none"

        summary = {
            "avg_calories": 2200,
            "avg_protein": 100,
            "avg_carbs": 250,
            "avg_fats": 70,
            "days_tracked": 7
        }

        result = generate_nutrition_advice(MockProfile(), summary)

        self.assertEqual(result.summary, "You are doing well but need more protein.")
        self.assertEqual(len(result.advice), 3)
        self.assertIn("Increase lean protein intake", result.advice)