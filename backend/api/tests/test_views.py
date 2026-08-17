from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Profile, Recipe, DailyCalories
from datetime import date
import json


class ProfileViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_profile(self):
        data = {
            'date_of_birth': '1990-01-01',
            'weight': 70.5,
            'height': 175,
            'gender': 'M',
            'activity_level': 'moderate',
            'fitness_goal': 'lose_weight',
            'calorie_goal': 1800
        }
        
        response = self.client.post('/api/profile/create/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['weight'], '70.50')
        self.assertEqual(response.data['height'], '175.00')
    
    def test_cannot_create_duplicate_profile(self):
        Profile.objects.create(
            user=self.user,
            date_of_birth= '1990-01-01',
            weight=70,
            height=175,
            gender= 'M',
            activity_level= 'moderate',
            fitness_goal= 'lose_weight',
            calorie_goal= 2000
        )
        
        data = {'weight': 80, 'height': 180}
        response = self.client.post('/api/profile/create/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_profile(self):
        Profile.objects.create(
            user=self.user,
            date_of_birth='1990-01-01',
            weight=70,
            height=175,
            gender='M',
            activity_level='moderate',
            fitness_goal='lose_weight',
            calorie_goal=2000
        )
        
        response = self.client.get('/api/profile/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['calorie_goal'], 2000)


class RecipeViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('chef', password='pass')
        self.client.force_authenticate(user=self.user)
        
        self.recipe = Recipe.objects.create(
            user=self.user,
            title='Test Recipe',
            servings=4,
            calories_per_serving=300,
            ingredients=['ingredient 1'],
            instructions=['step 1', 'step 2', 'step 3']
        )

    def test_list_recipes(self):
        response = self.client.get('/api/recipes/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Recipe')

    def test_user_only_sees_own_recipes(self):
        other_user = User.objects.create_user('other', password='pass')
        Recipe.objects.create(
            user=other_user,
            title='Other Recipe',
            servings=2,
            calories_per_serving=200
        )
        
        response = self.client.get('/api/recipes/')
        
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Recipe')

    def test_toggle_favorite(self):
        self.assertFalse(self.recipe.is_favorite)
        
        response = self.client.patch(
            f'/api/recipes/{self.recipe.id}/',
            {'is_favorite': True},
            format='multipart'
        )

        self.recipe.refresh_from_db()
        self.assertTrue(self.recipe.is_favorite)

    def test_delete_recipe(self):
        recipe_id = self.recipe.id
        
        response = self.client.delete(f'/api/recipes/{recipe_id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Recipe.objects.filter(id=recipe_id).exists())


class DailyCaloriesViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user('user', password='pass')
        self.client.force_authenticate(user=self.user)

    def test_add_calories(self):
        data = {
            'date': str(date.today()),
            'calories_consumed': 500,
            'protein_consumed': 25,
            'carbs_consumed': 50,
            'fats_consumed': 15
        }
        
        response = self.client.post('/api/daily-calories/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['calories_consumed'], 500)

    def test_aggregate_daily_calories(self):
        today = str(date.today())
        
        self.client.post('/api/daily-calories/', {
            'date': today,
            'calories_consumed': 300
        }, format='json')
        
        self.client.post('/api/daily-calories/', {
            'date': today,
            'calories_consumed': 200
        }, format='json')
        
        response = self.client.get('/api/daily-calories/')
        
        today_entry = next(e for e in response.data if e['date'] == today)
        self.assertEqual(today_entry['calories_consumed'], 500)