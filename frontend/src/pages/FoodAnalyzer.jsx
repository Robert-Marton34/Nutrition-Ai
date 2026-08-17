import { useState } from "react"
import api from "../api"

function FoodAnalyzer() {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [description, setDescription] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [addingToDaily, setAddingToDaily] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [errorMessageCal, setErrorMessageCal] = useState("")
  const [addedSuccess, setAddedSuccess] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      setResult(null)
    }
  }

  const analyzeFood = async () => {
    setErrorMessage("")
    if (!image) {
      setErrorMessage("Please select an image first")
      return
    }

    setAnalyzing(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('description', description)

      const res = await api.post("/api/ai/analyze-food/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const parsed = Object.fromEntries(res.data)

      setResult(parsed)
    } catch (err) {
      console.error("Analysis failed:", err)
      setErrorMessage("Failed to analyze food. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const addToDaily = async () => {
    if (!result) return

    setAddingToDaily(true)
    setAddedSuccess(false)

    try {
      const today = new Date().toISOString().split("T")[0]

      await api.post("/api/daily-calories/", {
        date: today,
        calories_consumed: Math.round(result.calories),
        protein_consumed: Math.round(result.protein),
        carbs_consumed: Math.round(result.carbs),
        fats_consumed: Math.round(result.fats)
      })

      setAddedSuccess(true)

    } catch (err) {
      console.error("Failed to add to daily:", err)
      setErrorMessageCal("Failed to add to daily calories. Please try again. If failed twice try again later.")
    } finally {
      setAddingToDaily(false)
    }
  }

  const resetForm = () => {
    setImage(null)
    setImagePreview(null)
    setDescription("")
    setResult(null)
    setAddedSuccess(false)
    setErrorMessageCal("") 
  }

  const confidenceBadge = (confidence) => {
    switch(confidence) {
      case 'high': return 'bg-green-500/30 text-green-200'
      case 'medium': return 'bg-yellow-500/30 text-yellow-200'
      case 'low': return 'bg-red-500/30 text-red-200'
      default: return 'bg-gray-500/30 text-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-white space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">AI Food Scanner</h1>
        <p className="text-white/70 mt-2">Upload a food image and get instant nutritional estimates</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Upload Food Image</h2>

          {/* Image Upload */}
          {imagePreview ? (
            <div className="relative mb-6">
              <img 
                src={imagePreview} 
                alt="Food preview" 
                className="w-full h-80 object-cover rounded-xl"
              />
              <button
                onClick={resetForm}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl transition shadow-lg"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="block w-full h-80 border-2 border-dashed border-white/30 rounded-xl hover:border-[#FF7582] transition cursor-pointer mb-6">
              <div className="h-full flex flex-col items-center justify-center text-white/60 hover:text-white/80">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-semibold mb-2">Click to upload food image</p>
                <p className="text-sm">PNG, JPG up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}

          {/* Description Input */}
          <div className="mb-6">
            <label className="block text-sm mb-2 font-semibold">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grilled chicken with rice and vegetables"
              className="w-full bg-black/30 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF7582] min-h-[100px]"
            />
            <p className="text-xs text-white/60 mt-2">
              💡 Adding a description helps improve accuracy
            </p>
          </div>

        {addedSuccess && (
          <div className="
            bg-green-500/20
            border border-green-400/40
            text-green-200
            text-sm
            rounded-xl
            px-4 py-2
          ">
            ✓ Successfully added to today's calories!
          </div>
        )}

        {errorMessage&& (
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

          {/* Analyze Button */}
          <button
            onClick={analyzeFood}
            disabled={!image || analyzing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF7582] to-[#ff5c6b] hover:from-[#ff5c6b] hover:to-[#FF7582] font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {analyzing ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              "🔍 Analyze Food"
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>

          {!result ? (
            <div className="h-full flex items-center justify-center text-white/40 text-center">
              <div>
                <p className="text-6xl mb-4">📊</p>
                <p className="text-lg">Upload an image and click analyze</p>
                <p className="text-sm mt-2">AI will estimate nutritional values</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Food Name & Confidence */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{result.food_name}</h3>
                  {result.portion_size && (
                    <p className="text-white/70 text-sm">
                      <span className="font-semibold">Portion:</span> {result.portion_size}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${confidenceBadge(result.confidence)}`}>
                  {result.confidence?.toUpperCase()} confidence
                </span>
              </div>

              {/* Description */}
              <div className="bg-black/30 rounded-xl p-4 border border-white/20">
                <p className="text-white/90 text-sm leading-relaxed">{result.description}</p>
              </div>

              {/* Nutrition Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#FF7582]/20 to-[#ff5c6b]/20 rounded-xl p-4 border border-[#FF7582]/30">
                  <p className="text-white/70 text-sm mb-1">Calories</p>
                  <p className="text-3xl font-bold">{result.calories}</p>
                  <p className="text-xs text-white/60">kcal</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
                  <p className="text-white/70 text-sm mb-1">Protein</p>
                  <p className="text-3xl font-bold">{result.protein}</p>
                  <p className="text-xs text-white/60">grams</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
                  <p className="text-white/70 text-sm mb-1">Carbs</p>
                  <p className="text-3xl font-bold">{result.carbs}</p>
                  <p className="text-xs text-white/60">grams</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-4 border border-yellow-500/30">
                  <p className="text-white/70 text-sm mb-1">Fats</p>
                  <p className="text-3xl font-bold">{result.fats}</p>
                  <p className="text-xs text-white/60">grams</p>
                </div>
              </div>

              {/* Ingredients */}
              {result.ingredients && result.ingredients.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-white/80">Detected Ingredients:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.ingredients.map((ingredient, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm border border-white/20">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {result.notes && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-sm text-yellow-200">
                    <span className="font-semibold">ℹ️ Note:</span> {result.notes}
                  </p>
                </div>
              )}


              {errorMessageCal && (
              <div className="
                bg-red-500/20
                border border-red-400/40
                text-red-200
                text-sm
                rounded-xl
                px-4 py-2
                ">
                  {errorMessageCal}
                </div>
              )}    

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={addToDaily}
                  disabled={addingToDaily}
                  className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {addingToDaily ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    "✓ Add to Today's Calories"
                  )}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 font-semibold transition shadow-lg"
                >
                  New Scan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FoodAnalyzer