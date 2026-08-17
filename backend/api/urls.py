from django.urls import path
from . import views


urlpatterns = [
    path("profile/create/", views.ProfileCreateView.as_view()),
    path("profile/status/", views.ProfileStatusView.as_view()), 
    path("profile/", views.ProfileView.as_view()),

    path("daily-calories/", views.DailyCaloriesView.as_view()),
    path("daily-calories/<int:pk>/", views.DailyCaloriesDetailView.as_view()),

    path('recipes/', views.RecipeListCreate.as_view(), name='recipe-list-create'),
    path('recipes/<int:pk>/', views.RecipeDetail.as_view(), name='recipe-detail'),

    path("recipes/generate/", views.GenerateRecipeView.as_view(), name="generate-recipe"),
    path("ai/advice/", views.NutritionAdviceView.as_view(), name="ai-advice"),
    path("ai/analyze-food/", views.AnalyzeFoodImageView.as_view(), name="analyze-food"),
]