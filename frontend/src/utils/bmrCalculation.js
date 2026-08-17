export const calculateBMR = ({age, height, weight, gender, activityLevel, fitnessGoal}) => {
    const w = Number(weight)
    const h = Number(height)
    const a = age

    //BMR calculation (Mifflin St Jeor)
    let bmr =
      gender === "Male"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161

    const activityMultipliers = {
      "Sedentary": 1.2,
      "Lightly Active": 1.375,
      "Moderately Active": 1.55,
      "Very Active": 1.725,
      "Extremely Active": 1.9,
    }

    let calories = bmr * activityMultipliers[activityLevel]

    if (fitnessGoal === "Lose Weight")
      calories -= 500
    else if (fitnessGoal === "Gain Muscle")
      calories += 300

    calories = Math.round(calories)

    return {
        calories,
        protein: Math.round((calories * 0.3) / 4),
        carbs: Math.round((calories * 0.4) / 4),
        fats: Math.round((calories * 0.3) / 9),
    }
}
