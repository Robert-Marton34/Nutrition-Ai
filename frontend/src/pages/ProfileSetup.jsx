import { useEffect ,useState } from "react"
import api from "../api"
import { useNavigate } from "react-router-dom"
import {
  DIET_OPTIONS,
  ALLERGIES,
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
} from "../utils/nutritionConstants"
import { calculateBMR as calculateBMR } from "../utils/bmrCalculation"


function ProfileSetup() {
  const [dateOfBirth, setDateOfBirth] = useState("")
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

  const [errorMessage, setErrorMessage] = useState("")
  const [errorMessageSub, setErrorMessageSub] = useState("")

  const navigate = useNavigate()
     
  useEffect(() => {
    const profileChecker = async () => {
      const profileStatus = await api.get("/api/profile/status/")
        if (profileStatus.data.has_profile){
          navigate("/home")
        }
    }
    profileChecker()
  }, [])

  const toggleAllergy = (item) => {
    setAllergies((prev) =>
      prev.includes(item)
        ? prev.filter((a) => a !== item)
        : [...prev, item]
    )
  }

  const calculateAge = (date_of_birth) => {
    if (!date_of_birth) return null
    const birthDate = new Date(date_of_birth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const calculateGoals = () => {
    const age = calculateAge(dateOfBirth)
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

  const submitProfile = async (e) => {
    e.preventDefault()
    setErrorMessageSub("")
    if (!dateOfBirth || !height || !weight || !gender || !activityLevel || !fitnessGoal || !calorieGoal || !proteinGoal || !carbsGoal || !fatsGoal ) {
      setErrorMessageSub("Please fill in the required fields")
      return
    }
    

    await api.post("/api/profile/create/", {
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

    navigate("/home")
  }

  const inputStyle = "w-full rounded-xl bg-black/30 border border-white/30 px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF7582]"

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <form
        onSubmit={submitProfile}
        className="
          w-full max-w-4xl
          rounded-3xl
          bg-gradient-to-br from-[#355C7D]/90 via-[#725A7A]/90 to-[#C56C86]/90
          backdrop-blur-xl
          border border-white/20
          shadow-2xl
          p-10
          space-y-6
          text-white
        "
      >
        <h1 className="text-3xl font-bold text-center">
          Set up your profile
        </h1>

        <p className="text-sm text-white/80 text-center">
          Personalize your nutrition experience
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* LEFT COLUMN — USER INFO */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-white/70">
                Date of Birth *
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputStyle}
                required
              />
            </div>

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
                placeholder="e.g., 175"
                required
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
                placeholder="e.g., 70"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-white/70">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={inputStyle}
                required
              >
                <option value="">Select gender</option>
                <option className="text-black">Male</option>
                <option className="text-black">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-white/70">
                Activity Level *
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className={inputStyle}
                required
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
                required
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
                placeholder="Click Calculate Goals"
                readOnly
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
                placeholder="Click Calculate Goals"
                readOnly
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
                placeholder="Click Calculate Goals"
                readOnly
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
                placeholder="Click Calculate Goals"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* CALCULATE GOALS BUTTON */}
        <button
          type="button"
          onClick={calculateGoals}
          className="
            w-full rounded-xl bg-blue-500 py-3 font-semibold
            hover:bg-blue-600 transition shadow-lg
          "
        >
          Calculate Goals
        </button>

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
            <option value="">Select diet (optional)</option>
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
            Allergies (optional)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ALLERGIES.map(item => (
              <label
                key={item}
                className="
                  flex items-center gap-2
                  text-sm
                  bg-black/20
                  rounded-lg
                  px-3 py-2
                  cursor-pointer
                  hover:bg-black/30
                "
              >
                <input
                  type="checkbox"
                  checked={allergies.includes(item)}
                  onChange={() => toggleAllergy(item)}
                  className="accent-[#FF7582]"
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

        {/* SUBMIT */}
        <button
          type="submit"
          className="
            w-full rounded-xl
            bg-[#FF7582]
            py-3
            font-semibold
            shadow-xl shadow-[#FF7582]/30
            hover:bg-[#ff5c6b]
            transition
          "
        >
          Complete Setup
        </button>
      </form>
    </div>
  )
}

export default ProfileSetup