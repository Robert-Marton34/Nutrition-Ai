import { useState, useEffect } from "react"
import api from "../../api"

function AIRecipeModal({ onClose, onRecipeCreated }) {
  const [ingredients, setIngredients] = useState([""])
  const [useDietaryPreferences, setUseDietaryPreferences] = useState(true)
  const [useAllergens, setUseAllergens] = useState(true)
  const [matchCalorieGoal, setMatchCalorieGoal] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [profile, setProfile] = useState(null)   //Fetch profile for user preferences

  useEffect(() => {
    api.get("/api/profile/").then(res => {
      setProfile(res.data)
    }).catch(err => {
      console.error("Failed to fetch profile:", err)
    })
  }, [])

  const addIngredient = () => setIngredients([...ingredients, ""])
  const removeIngredient = (idx) => setIngredients(ingredients.filter((_, i) => i !== idx))
  const updateIngredient = (idx, value) => {
    const updated = [...ingredients]
    updated[idx] = value
    setIngredients(updated)
  }

  const handleGenerate = async () => {
    const validIngredients = ingredients.filter(i => i.trim())
    
    if (validIngredients.length === 0) {
      setErrorMessage("Please enter at least one ingredient.")
      return
    }
    try {
      setGenerating(true)

      const res = await api.post("/api/recipes/generate/", {
        ingredients: validIngredients,
        useDietaryPreferences,
        useAllergens,
        matchCalorieGoal
      })

      console.log("Generated recipe:", res.data)
      onRecipeCreated()
    } catch (err) {
      console.error("AI recipe generation failed:", err)
      setErrorMessage("Failed to generate recipe. Please try again. If failed twice try again later.")
    } finally {
      setGenerating(false)
    }
  }

  const inputStyle = "w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF7582]"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#355C7D]/95 via-[#725A7A]/95 to-[#C56C86]/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-black/30 backdrop-blur-xl border-b border-white/20 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">✨ Generate Recipe with AI</h2>
            <button onClick={onClose} className="text-white/60 hover:text-white text-3xl">×</button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold">
                What ingredients do you have? *
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="text-sm px-3 py-1 bg-[#FF7582] hover:bg-[#ff5c6b] rounded-lg transition font-semibold"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ingredient, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(idx, e.target.value)}
                    className={inputStyle}
                    placeholder="e.g., 2 chicken breasts, 1 cup broccoli, 200g rice"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="px-3 bg-red-500 hover:bg-red-600 rounded-lg transition text-white"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-white/60 mt-2">
              💡 List your available ingredients. Include amounts if you know them!
            </p>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="font-semibold mb-3">AI Preferences</h3>
            <div className="space-y-3">
              
              <label className="flex items-center gap-3 bg-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/20 transition">
                <input
                  type="checkbox"
                  checked={useDietaryPreferences}
                  onChange={(e) => setUseDietaryPreferences(e.target.checked)}
                  className="w-5 h-5 accent-[#FF7582]"
                />
                <div className="flex-1">
                  <p className="font-semibold">Use my dietary preferences</p>
                  {profile?.dietary_preferences ? (
                    <p className="text-sm text-white/70">Current: {profile.dietary_preferences}</p>
                  ) : (
                    <p className="text-sm text-white/50 italic">No dietary preference set</p>
                  )}
                </div>
              </label>

              <label className="flex items-center gap-3 bg-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/20 transition">
                <input
                  type="checkbox"
                  checked={useAllergens}
                  onChange={(e) => setUseAllergens(e.target.checked)}
                  className="w-5 h-5 accent-[#FF7582]"
                />
                <div className="flex-1">
                  <p className="font-semibold">Avoid my allergen restrictions</p>
                  {profile?.allergies && profile.allergies.length > 0 ? (
                    <p className="text-sm text-white/70">Allergies: {profile.allergies.join(", ")}</p>
                  ) : (
                    <p className="text-sm text-white/50 italic">No allergies set</p>
                  )}
                </div>
              </label>

              <label className="flex items-center gap-3 bg-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/20 transition">
                <input
                  type="checkbox"
                  checked={matchCalorieGoal}
                  onChange={(e) => setMatchCalorieGoal(e.target.checked)}
                  className="w-5 h-5 accent-[#FF7582]"
                />
                <div className="flex-1">
                  <p className="font-semibold">Match my calorie goal</p>
                  {profile?.calorie_goal ? (
                    <p className="text-sm text-white/70">
                      Target: ~{Math.round(profile.calorie_goal / 3)} cal/serving
                    </p>
                  ) : (
                    <p className="text-sm text-white/50 italic">No calorie goal set</p>
                  )}
                </div>
              </label>

            </div>
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

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 py-3 rounded-xl bg-[#FF7582] hover:bg-[#ff5c6b] font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? "Generating..." : "✨ Generate Recipe"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AIRecipeModal