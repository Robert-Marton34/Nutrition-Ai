from django.test import TestCase
from django.contrib.auth.models import User
from api.models import Profile, Recipe
from datetime import date
from decimal import Decimal


class ProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.profile = Profile.objects.create(
            user=self.user,
            date_of_birth=date(1990, 1, 1),
            weight=70.5,
            height=175,
            gender='M',
            activity_level='moderate',
            dietary_preferences='vegetarian',
            allergies=['peanuts', 'shellfish'],
            fitness_goal='maintain',
            calorie_goal=2000
        )

    def test_profile_creation(self):
        self.assertEqual(self.profile.user.username, 'testuser')
        self.assertEqual(self.profile.weight, Decimal('70.5'))
        self.assertEqual(self.profile.height, 175)

    def test_age_calculation(self):
        today = date.today()
        expected_age = today.year - 1990
        
        # Account for birthday not yet passed this year
        if (today.month, today.day) < (1, 1):
            expected_age -= 1
            
        self.assertEqual(self.profile.age, expected_age)

    def test_age_with_no_birthdate(self):
        profile = Profile.objects.create(
            user=User.objects.create_user('user2', 'user2@test.com', 'pass'),
            weight=80,
            height=180
        )
        self.assertIsNone(profile.age)

    def test_string_representation(self):
        expected = f"testuser Profile"
        self.assertEqual(str(self.profile), expected)

    def test_allergies_as_list(self):
        self.assertIsInstance(self.profile.allergies, list)
        self.assertIn('peanuts', self.profile.allergies)
        self.assertEqual(len(self.profile.allergies), 2)


class RecipeModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('chef', 'chef@test.com', 'pass')
        self.recipe = Recipe.objects.create(
            user=self.user,
            title='Chicken Stir Fry',
            description='Quick and healthy',
            servings=4,
            total_time_minutes=30,
            ingredients=['chicken', 'vegetables', 'soy sauce'],
            instructions=['Cook chicken', 'Add vegetables', 'Season'],
            calories_per_serving=350,
            protein_per_serving=25.5,
            carbs_per_serving=30.0,
            fats_per_serving=12.5,
            source='manual',
            is_favorite=False
        )

    def test_recipe_creation(self):
        self.assertEqual(self.recipe.title, 'Chicken Stir Fry')
        self.assertEqual(self.recipe.servings, 4)
        self.assertEqual(len(self.recipe.ingredients), 3)

    def test_recipe_ordering(self):
        recipe2 = Recipe.objects.create(
            user=self.user,
            title='Pasta',
            servings=2,
            calories_per_serving=400
        )
        
        recipes = Recipe.objects.filter(user=self.user)
        self.assertEqual(recipes[0].title, 'Pasta') 
        self.assertEqual(recipes[1].title, 'Chicken Stir Fry')

    def test_favorite_toggle(self):
        self.assertFalse(self.recipe.is_favorite)
        self.recipe.is_favorite = True
        self.recipe.save()
        self.recipe.refresh_from_db()
        self.assertTrue(self.recipe.is_favorite)