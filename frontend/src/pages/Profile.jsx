import { useEffect, useState } from "react"
import api from "../api"
import {
  DIET_OPTIONS,
  ALLERGIES,
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
} from "../utils/nutritionConstants"
import { calculateBMR as calculateBMR } from "../utils/bmrCalculation"


function Profile() {
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [age, setAge] = useState(null) //Read-only from backend
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [gender, setGender] = useState("")
  const [activityLevel, setActivityLevel] = useState("")
  const [fitnessGoal, setFitnessGoal] = useState("") 

  const [calorieGoal, setCalorieGoal] = useState("")
  const [proteinGoal, setProteinGoal] = useState("")
  const [carbsGoal, setCarbsGoal] = useState("")
  const [fatsGoal, setFatsGoal] = useState("")

  const [diet, setDiet] = useState("")
  const [allergies, setAllergies] = useState([])

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [errorMessageSub, setErrorMessageSub] = useState("")

  useEffect(() => {
    api.get("/api/profile/").then(res => {
      setDateOfBirth(res.data.date_of_birth || "")
      setAge(res.data.age || "")
      setHeight(res.data.height || "")
      setWeight(res.data.weight || "")
      setGender(res.data.gender || "")
      setActivityLevel(res.data.activity_level || "")
      setFitnessGoal(res.data.fitness_goal || "")

      setCalorieGoal(res.data.calorie_goal)
      setProteinGoal(res.data.protein_goal || "")
      setCarbsGoal(res.data.carbs_goal || "")
      setFatsGoal(res.data.fats_goal || "")

      setDiet(res.data.dietary_preferences || "")
      setAllergies(res.data.allergies || [])
    })
  }, [])

  const toggleAllergy = (item) => {
    setAllergies(prev =>
      prev.includes(item)
        ? prev.filter(a => a !== item)
        : [...prev, item]
    )
  }

  const calculateGoals = () => {
    setErrorMessage("")

    if (!age || !height || !weight || !gender || !activityLevel || !fitnessGoal) {
      setErrorMessage("Please fill Age, Height, Weight, Gender, Activity Level, and Fitness Goal first.")
      return
    }

    const result = calculateBMR({age, height, weight, gender, activityLevel, fitnessGoal})

    setCalorieGoal(result.calories)
    setProteinGoal(result.protein)
    setCarbsGoal(result.carbs)
    setFatsGoal(result.fats)
  }

  const saveProfile = async (e) => {
    e.preventDefault()

    setErrorMessageSub("")
    if (!dateOfBirth || !height || !weight || !activityLevel || !fitnessGoal || !calorieGoal || !proteinGoal || !carbsGoal || !fatsGoal ) {
      setErrorMessageSub("Please fill in the required fields")
      return
    }

    setLoading(true)


    await api.patch("/api/profile/", {
      date_of_birth: dateOfBirth,
      height,
      weight,
      gender,
      activity_level: activityLevel,
      fitness_goal: fitnessGoal,

      calorie_goal: calorieGoal,
      protein_goal: proteinGoal,
      carbs_goal: carbsGoal,
      fats_goal: fatsGoal,

      dietary_preferences: diet,
      allergies
    })

    setSaved(true)
    setLoading(false)

    setTimeout(() => setSaved(false), 2000)
  }
  const inputStyle = "w-full rounded-xl bg-black/30 border border-white/30 px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF7582]"

  return (

    <div className="max-w-4xl mx-auto p-10 text-white">

      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl">

        <h1 className="text-2xl font-bold mb-6">
          Profile Settings
        </h1>

        <form onSubmit={saveProfile} className="space-y-6">

          <div className="grid md:grid-cols-2 gap-8">

            {/* LEFT COLUMN — USER INFO */}
            <div className="space-y-4">

              <div>
                <label className="block text-sm mb-1 text-white/70">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-white/70">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-white/70">
                  Activity Level *
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className={inputStyle}
                >
                  <option value="">Select activity level</option>
                  {ACTIVITY_LEVELS.map(level => (
                    <option key={level} className="text-black">
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-white/70">
                  Fitness Goal *
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className={inputStyle}
                >
                  <option value="">Select goal</option>
                  {FITNESS_GOALS.map(goal => (
                    <option key={goal} className="text-black">
                      {goal}
                    </option>
                  ))}
                </select>
              </div>

            </div>


            {/* RIGHT COLUMN — GOALS */}
            <div className="space-y-4">

              <div>
                <label className="block text-sm mb-1 text-white/70">
                  Calorie Goal *
                </label>
                <input
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-white/70">
                  Protein Goal (g) *
                </label>
                <input
                  type="number"
                  value={proteinGoal}
                  onChange={(e) => setProteinGoal(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-white/70">
                  Carbs Goal (g) *
                </label>
                <input
                  type="number"
                  value={carbsGoal}
                  onChange={(e) => setCarbsGoal(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-white/70">
                  Fats Goal (g) *
                </label>
                <input
                  type="number"
                  value={fatsGoal}
                  onChange={(e) => setFatsGoal(e.target.value)}
                  className={inputStyle}
                />
              </div>

            </div>

          </div>


          {/* BUTTON ROW */}
          <div className="flex gap-4">

            <button
              type="button"
              onClick={calculateGoals}
              className="
                flex-1 rounded-xl bg-blue-500 py-3 font-semibold
                hover:bg-blue-600 transition
              "
            >
              Calculate Goals
            </button>



          </div>

          {errorMessage && (
          <div className="
            bg-red-500/20
            border border-red-400/40
            text-red-200
            text-sm
            rounded-xl
            px-4 py-2
            ">
              {errorMessage}
            </div>
          )}


          {/* DIET */}
          <div>
            <label className="block text-sm mb-1 text-white/70">
              Dietary Preference
            </label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className={inputStyle}
            >
              <option value="">Select diet</option>
              {DIET_OPTIONS.map(opt => (
                <option key={opt} className="text-black">
                  {opt}
                </option>
              ))}
            </select>
          </div>


          {/* ALLERGIES */}
          <div>
            <label className="block text-sm mb-2 text-white/70">
              Allergies
            </label>

            <div className="grid grid-cols-3 gap-2">
              {ALLERGIES.map(item => (
                <label key={item}
                  className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={allergies.includes(item)}
                    onChange={() => toggleAllergy(item)}
                  />

                  {item}

                </label>
              ))}
            </div>
          </div>

        {errorMessageSub && (
        <div className="
          bg-red-500/20
          border border-red-400/40
          text-red-200
          text-sm
          rounded-xl
          px-4 py-2
          ">
            {errorMessageSub}
          </div>
        )}    

          {/* SAVE */}
          <button
            disabled={loading}
            className="
              w-full rounded-xl bg-[#FF7582] py-3 font-semibold
              hover:bg-[#ff5c6b] transition
            "
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          {saved &&
            <p className="text-center text-green-400">
              Profile saved ✓
            </p>
          }


        </form>
      </div>
    </div>
  )
}

export default Profile