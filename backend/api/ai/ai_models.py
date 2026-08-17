from pydantic import BaseModel, Field
from typing import List


class AIRecipe(BaseModel):
    title: str
    description: str = Field(default="")
    servings: int = Field(..., ge=1, le=12)
    total_time_minutes: int = Field(..., ge=5, le=180)
    ingredients: List[str] = Field(..., min_length=2, max_length=10)
    instructions: List[str] = Field(..., min_length=3, max_length=8)
    calories_per_serving: int = Field(..., ge=100, le=1500)
    protein_per_serving: float = Field(..., ge=0)
    carbs_per_serving: float = Field(..., ge=0)
    fats_per_serving: float = Field(..., ge=0)

class AINutritionAdvice(BaseModel):
    summary: str
    advice: List[str] = Field(..., min_length=1, max_length=5)

class FoodAnalysis(BaseModel):
    food_name: str
    description: str
    portion_size: str
    confidence: str

    calories: int = Field(..., ge=0, le=5000)
    protein: float = Field(..., ge=0, le=500)
    carbs: float = Field(..., ge=0, le=500)
    fats: float = Field(..., ge=0, le=500)

    ingredients: List[str] = Field(..., min_length=1)
    notes: str