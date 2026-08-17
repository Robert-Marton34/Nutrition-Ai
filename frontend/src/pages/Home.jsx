import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const GOAL_COLOR = "#FF7582"
const BG_COLOR = "rgba(255,255,255,.15)"

function Home() {
  const navigate = useNavigate()
  //Guages
  const [entries, setEntries] = useState([])
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fats, setFats] = useState("")
  const [goal, setGoal] = useState(null)

  const [proteinGoal, setProteinGoal] = useState(null)
  const [carbsGoal, setCarbsGoal] = useState(null)
  const [fatsGoal, setFatsGoal] = useState(null)


  //Add recipe
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [servings, setServings] = useState(1)
  const [showRecipeSearch, setShowRecipeSearch] = useState(false)

  //Ai ddvice
  const [aiAdvice, setAiAdvice] = useState(null)
  const [loadingAdvice, setLoadingAdvice] = useState(false)
  const [showAdvice, setShowAdvice] = useState(false)
  const [errorMessageAI, setErrorMessageAI] = useState("")

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const loadData = async () => {
      const profileStatus = await api.get("/api/profile/status/")
            if (!profileStatus.data.has_profile){
              navigate("/profile-setup")
            }

      const caloriesRes = await api.get("/api/daily-calories/")
      setEntries(caloriesRes.data)

      const profileRes = await api.get("/api/profile/")
      setGoal(profileRes.data.calorie_goal)
      setProteinGoal(profileRes.data.protein_goal)
      setCarbsGoal(profileRes.data.carbs_goal)
      setFatsGoal(profileRes.data.fats_goal)

      const recipesRes = await api.get("/api/recipes/")
      setRecipes(recipesRes.data)
    }
    loadData()
  }, [])

  const filteredRecipes = recipes.filter(recipe => recipe.title.toLowerCase().includes(search.toLowerCase()))

  const addRecipeToToday = async () => {
    const totalCalories = (selectedRecipe.calories_per_serving/selectedRecipe.servings) * servings
    const totalProtein = ((selectedRecipe.protein_per_serving || 0)/selectedRecipe.servings) * servings
    const totalCarbs = ((selectedRecipe.carbs_per_serving || 0)/selectedRecipe.servings) * servings
    const totalFats = ((selectedRecipe.fats_per_serving || 0)/selectedRecipe.servings) * servings

    await api.post("/api/daily-calories/", {
      date: today,
      calories_consumed: Math.round(totalCalories),
      protein_consumed: Math.round(totalProtein),
      carbs_consumed: Math.round(totalCarbs),
      fats_consumed: Math.round(totalFats),
    })

    //Reset
    setSelectedRecipe(null)
    setServings(1)
    setSearch("")
    setShowRecipeSearch(false)

    //Refresh data
    const res = await api.get("/api/daily-calories/")
    setEntries(res.data)
  }
  

  const todayEntry = entries.find(e => e.date === today)

  const consumed = todayEntry?.calories_consumed || 0
  const proteinToday = todayEntry?.protein_consumed || 0
  const carbsToday = todayEntry?.carbs_consumed || 0
  const fatsToday = todayEntry?.fats_consumed || 0

  const remaining = goal ? Math.max(goal - consumed, 0) : 0
  const gaugeColor = consumed > goal ? "#FF3333" : GOAL_COLOR

  const totalMacroCalories = proteinToday * 4 + carbsToday * 4 + fatsToday * 9

  const proteinPercent = totalMacroCalories ? Math.round((proteinToday * 4 / totalMacroCalories) * 100) : 0
  const carbsPercent = totalMacroCalories ? Math.round((carbsToday * 4 / totalMacroCalories) * 100) : 0
  const fatsPercent = totalMacroCalories ? Math.round((fatsToday * 9 / totalMacroCalories) * 100) : 0

  const gaugeData = [
    { name: "Consumed", value: consumed },
    { name: "Remaining", value: remaining },
  ]

  const macroData = [
    { name: "Protein", value: proteinToday * 4 },
    { name: "Carbs", value: carbsToday * 4 },
    { name: "Fats", value: fatsToday * 9 },
  ]


  const addCalories = async (e) => {
    e.preventDefault()

    await api.post("/api/daily-calories/", {
      date: today,
      calories_consumed: Number(calories),
    })

    setCalories("")
    const res = await api.get("/api/daily-calories/")
    setEntries(res.data)
  }


  const addMacros = async (e) => {
    e.preventDefault()

    await api.post("/api/daily-calories/", {
      date: today,
      protein_consumed: protein || 0,
      carbs_consumed: carbs || 0,
      fats_consumed: fats || 0,
    })

    setProtein("")
    setCarbs("")
    setFats("")

    const res = await api.get("/api/daily-calories/")
    setEntries(res.data)
  }

  const avgCalories = (days) => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const filtered = entries.filter(e => new Date(e.date) >= cutoff)
    if (!filtered.length) return 0

    return Math.round(
      filtered.reduce((sum, e) => sum + (e.calories_consumed || 0), 0) /
      filtered.length
    )
  }

  const macroAverage = (days) => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().split("T")[0]

    const filtered = entries.filter(e => e.date >= cutoffStr)

    if (!filtered.length) return { protein: 0, carbs: 0, fats: 0 }

    const totals = filtered.reduce((acc, e) => {
      acc.protein += Number(e.protein_consumed) || 0
      acc.carbs += Number(e.carbs_consumed) || 0
      acc.fats += Number(e.fats_consumed) || 0
      return acc
    }, { protein: 0, carbs: 0, fats: 0 })

    const totalCalories =
      totals.protein * 4 +
      totals.carbs * 4 +
      totals.fats * 9

    if (!totalCalories) return { protein: 0, carbs: 0, fats: 0 }

    return {
      protein: Math.round((totals.protein * 4 / totalCalories) * 100),
      carbs: Math.round((totals.carbs * 4 / totalCalories) * 100),
      fats: Math.round((totals.fats * 9 / totalCalories) * 100),
    }
  }

  const getWeeklyData = () => {
    const last7Days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      
      const entry = entries.find(e => e.date === dateStr)
      
      last7Days.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: entry?.calories_consumed || 0,
        protein: entry?.protein_consumed || 0,
        carbs: entry?.carbs_consumed || 0,
        fats: entry?.fats_consumed || 0,
        goal: goal || 0
      })
    }
    
    return last7Days
  }

const getMonthlyData = () => {
    const last30Days = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      
      const entry = entries.find(e => e.date === dateStr)
      
      last30Days.push({
        date: dateStr,
        day: date.getDate(),
        calories: entry?.calories_consumed || 0,
        protein: entry?.protein_consumed || 0,
        carbs: entry?.carbs_consumed || 0,
        fats: entry?.fats_consumed || 0,
        goal: goal || 0
      })
    }
    
    return last30Days
  }


  const getAIAdvice = async () => {
    try {
      setLoadingAdvice(true)

      const res = await api.post("/api/ai/advice/")
      setAiAdvice(res.data)
      setShowAdvice(true)

    } catch (err) {
      console.error(err)
      setErrorMessageAI("Failed. Please try again. If failed twice try again later.")
    } finally {
      setLoadingAdvice(false)
    }
  }


  const weeklyMacros = macroAverage(7)
  const monthlyMacros = macroAverage(30)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 text-white">
      <div className="grid md:grid-cols-2 gap-8">

        {/* Calories Gauge */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-6">
            Today's Calories
          </h1>

          <div className="h-64 w-full min-w-0 relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={110}
                  dataKey="value"
                >
                  <Cell fill={gaugeColor} />
                  <Cell fill={BG_COLOR} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{consumed}</span>
              <span className="text-sm text-white/70">
                of {goal} kcal
              </span>
            </div>
          </div>

          <form onSubmit={addCalories} className="mt-6 space-y-3">
            <input
              type="number"
              placeholder="Calories eaten today"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full rounded-xl bg-black/30 border border-white/30 px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF7582]"
            />

            <button className="w-full rounded-xl bg-[#FF7582] hover:bg-[#ff5c6b] py-3 font-semibold transition">
              Add Calories
            </button>
          </form>

          {/* Recipe Search Section */}
          <div className="mt-4">
            <button
              onClick={() => setShowRecipeSearch(!showRecipeSearch)}
              className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 py-3 font-semibold transition"
            >
              {showRecipeSearch ? "Hide Recipe Search" : "Search Recipe"}
            </button>

            {showRecipeSearch && (
              <div className="mt-4 space-y-3">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search your recipes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl bg-black/30 border border-white/30 px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF7582]"
                />

                {/* Recipe List */}
                {search && (
                  <div className="max-h-48 overflow-y-auto space-y-2 bg-black/20 rounded-xl p-3">
                    {filteredRecipes.length === 0 ? (
                      <p className="text-white/60 text-sm text-center py-4">
                        No recipes found
                      </p>
                    ) : (
                      filteredRecipes.map(recipe => (
                        <button
                          key={recipe.id}
                          onClick={() => {
                            setSelectedRecipe(recipe)
                            setSearch(recipe.title)
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition ${
                            selectedRecipe?.id === recipe.id
                              ? 'bg-[#FF7582] text-white'
                              : 'bg-white/10 hover:bg-white/20 text-white/90'
                          }`}
                        >
                          <p className="font-semibold">{recipe.title}</p>
                          <p className="text-xs text-white/70">
                            {recipe.calories_per_serving/recipe.servings} cal/serving
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Selected Recipe Details */}
                {selectedRecipe && (
                  <div className="bg-gradient-to-br from-[#FF7582]/20 to-[#ff5c6b]/20 rounded-xl p-4 border border-[#FF7582]/30">
                    <p className="font-semibold mb-2">{selectedRecipe.title}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-white/70">Per serving:</p>
                        <p className="font-bold">{selectedRecipe.calories_per_serving/selectedRecipe.servings} cal</p>
                      </div>
                      <div>
                        <p className="text-white/70">Macros:</p>
                        <p className="text-xs">
                          P: {(selectedRecipe.protein_per_serving || 0)/selectedRecipe.servings}g |
                          C: {(selectedRecipe.carbs_per_serving || 0)/selectedRecipe.servings}g |
                          F: {(selectedRecipe.fats_per_serving || 0)/selectedRecipe.servings}g
                        </p>
                      </div>
                    </div>

                    {/* Servings Input */}
                    <div className="flex items-center gap-3 mb-3">
                      <label className="text-sm text-white/70">Servings:</label>
                      <input
                        type="number"
                        min="0.25"
                        //step="0.25"
                        value={servings}
                        onChange={(e) => setServings(Number(e.target.value))}
                        className="w-24 rounded-lg bg-black/30 border border-white/30 px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-[#FF7582]"
                      />
                    </div>

                    {/* Total Calculation */}
                    <div className="bg-black/30 rounded-lg p-3 mb-3">
                      <p className="text-sm text-white/70 mb-1">Total to add:</p>
                      <p className="text-lg font-bold">
                        {Math.round((selectedRecipe.calories_per_serving/selectedRecipe.servings) * servings)} calories
                      </p>
                      <p className="text-xs text-white/70">
                        P: {Math.round(((selectedRecipe.protein_per_serving || 0)/selectedRecipe.servings) * servings)}g |
                        C: {Math.round(((selectedRecipe.carbs_per_serving || 0)/selectedRecipe.servings) * servings)}g |
                        F: {Math.round(((selectedRecipe.fats_per_serving || 0)/selectedRecipe.servings) * servings)}g
                      </p>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={addRecipeToToday}
                      className="w-full rounded-xl bg-[#FF7582] hover:bg-[#ff5c6b] py-2 font-semibold transition"
                    >
                      Add to Today
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Macros Gauge */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-6">
            Today’s Macros
          </h1>

          <div className="flex items-center gap-6">
            {/* Pie chart */}
            <div className="h-64 w-64 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    startAngle={360}
                    endAngle={0}
                    innerRadius={50}
                    outerRadius={110}
                    dataKey="value"
                  >
                    <Cell fill="#4ADE80" /> {/* Protein */}
                    <Cell fill="#60A5FA" /> {/* Carbs */}
                    <Cell fill="#FACC15" /> {/* Fats */}
                    <Cell fill={BG_COLOR} /> {/* Background */}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Macro numbers */}
            <div className="flex flex-col space-y-2">
              <p className="text-green-400 font-semibold">
                Protein: {proteinToday}g ({proteinPercent}%)
              </p>
                <p className="text-xs text-white/60">
                Goal: {proteinGoal}g
              </p>
              <p className="text-blue-400 font-semibold">
                Carbs: {carbsToday}g ({carbsPercent}%)
              </p>
              <p className="text-xs text-white/60">
                Goal: {carbsGoal}g
              </p>
              <p className="text-yellow-400 font-semibold">
                Fats: {fatsToday}g ({fatsPercent}%)
              </p>
              <p className="text-xs text-white/60">
                Goal: {fatsGoal}g 
              </p>
            </div>
          </div>

          <form onSubmit={addMacros} className="mt-6 space-y-3">
            <input
              type="number"
              placeholder="Protein (g)"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full rounded-xl bg-black/30 border border-white/30 px-4 py-3 text-sm text-white"
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              className="w-full rounded-xl bg-black/30 border border-white/30 px-4 py-3 text-sm text-white"
            />
            <input
              type="number"
              placeholder="Fats (g)"
              value={fats}
              onChange={(e) => setFats(e.target.value)}
              className="w-full rounded-xl bg-black/30 border border-white/30 px-4 py-3 text-sm text-white"
            />

            <button className="w-full rounded-xl bg-[#4ADE80] py-3 font-semibold">
              Add Macros
            </button>
          </form>
        </div>
      </div>
      {/* AI Advice Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-xl">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">AI Nutrition Coach</h2>

          <button
            onClick={getAIAdvice}
            disabled={loadingAdvice}
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 transition font-semibold"
          >
            {loadingAdvice ? "Loading..." : "Get AI Advice"}
          </button>
        </div>

        {errorMessageAI&& (
        <div className="
          bg-red-500/20
          border border-red-400/40
          text-red-200
          text-sm
          rounded-xl
          px-4 py-2
          ">
            {errorMessageAI}
          </div>
        )}   

          {/* Advice Output */}
          {showAdvice && aiAdvice && (
            <div className="mt-4 space-y-4">

              {/* Summary */}
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Summary</p>
                <p className="font-semibold">{aiAdvice.summary}</p>
              </div>

              {/* Advice List */}
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-2">Recommendations</p>
                <ul className="list-disc list-inside space-y-1 text-white/90">
                  {aiAdvice.advice?.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}

      </div>
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Weekly Line Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Weekly Overview</h2>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getWeeklyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '14px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '14px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(53, 92, 125, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Legend wrapperStyle={{ color: 'white' }} />
                
                {/* Goal Line (dashed) */}
                <Line 
                  type="monotone" 
                  dataKey="goal" 
                  stroke="#9CA3AF" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={false}
                  name="Goal"
                />
                
                {/* Calories Line */}
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#FF7582" 
                  strokeWidth={3}
                  isAnimationActive={false}
                  dot={{ fill: '#FF7582', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Calories"
                />
                
                {/* Protein Line */}
                <Line 
                  type="monotone" 
                  dataKey="protein" 
                  stroke="#4ADE80" 
                  strokeWidth={2}
                  dot={{ fill: '#4ADE80', r: 3 }}
                  name="Protein (g)"
                />
                
                {/* Carbs Line */}
                <Line 
                  type="monotone" 
                  dataKey="carbs" 
                  stroke="#60A5FA" 
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={{ fill: '#60A5FA', r: 3 }}
                  name="Carbs (g)"
                />
                
                {/* Fats Line */}
                <Line 
                  type="monotone" 
                  dataKey="fats" 
                  stroke="#FACC15" 
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={{ fill: '#FACC15', r: 3 }}
                  name="Fats (g)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Avg Calories</p>
              <p className="text-2xl font-bold">{avgCalories(7)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Avg Protein</p>
              <p className="text-2xl font-bold text-green-400">{weeklyMacros.protein}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Avg Carbs</p>
              <p className="text-2xl font-bold text-blue-400">{weeklyMacros.carbs}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Avg Fats</p>
              <p className="text-2xl font-bold text-yellow-400">{weeklyMacros.fats}%</p>
            </div>
          </div>
        </div>

        {/* Monthly Bar Chart */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Monthly Overview</h2>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(53, 92, 125, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Legend wrapperStyle={{ color: 'white' }} />
                
                {/* Calories Bars */}
                <Bar 
                  dataKey="calories" 
                  fill="#FF7582" 
                  isAnimationActive={false}
                  radius={[8, 8, 0, 0]}
                  name="Calories"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Avg Calories</p>
              <p className="text-2xl font-bold">{avgCalories(30)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Avg Protein</p>
              <p className="text-2xl font-bold text-green-400">{monthlyMacros.protein}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Avg Carbs</p>
              <p className="text-2xl font-bold text-blue-400">{monthlyMacros.carbs}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Avg Fats</p>
              <p className="text-2xl font-bold text-yellow-400">{monthlyMacros.fats}%</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Home