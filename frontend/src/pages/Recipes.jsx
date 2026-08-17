import { useEffect, useState } from "react"
import api from "../api"
import RecipeCard from "./recipe/RecipeCard"
import RecipeDetail from "./recipe/RecipeDetail"
import ManualRecipe from "./recipe/ManualRecipe"
import AIRecipeModal from "./recipe/AIRecipe"

function Recipes() {
    const [recipes, setRecipes] = useState([]) //Recipes
    const [searchbar, setSearchbar] = useState("") //Searchbar
    const [loading, setLoading] = useState(true) //Loading Indicator

    //Popup Windows - Detail/Edit/Manual/AI
    const [showDetail, setShowDetail] = useState(false)
    const [showManualInput, setShowManualInput] = useState(false)
    const [showAI, setShowAI] = useState(false)

    //Stores current recipe
    const [selected, setSelected] = useState(null)

    const fetchRecipes = async () => {
        setLoading(true)
        try {
            const res = await api.get("/api/recipes/") 
            setRecipes(res.data)
        } catch (err) {
            console.error("Failed to fetch recipes:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecipes()
    }, [])

    const viewRecipe = (recipe) => {
        setSelected(recipe)
        setShowDetail(true)
    }

    const createdRecipe = () => {
        fetchRecipes()
        setShowAI(false)
        setShowManualInput(false)
    }

    const updatedRecipe = () => {
        fetchRecipes()
        setShowDetail(false)
    }

    const deletedRecipe = () => {
        fetchRecipes()
        setShowDetail(false)
    }

    const filteredRecipes = recipes
        .filter(recipe => recipe.title.toLowerCase().includes(searchbar.toLowerCase()))
        .sort((a, b) => {
            if (a.is_favorite !== b.is_favorite) {
                return b.is_favorite - a.is_favorite
            }
            return new Date(b.created_at) - new Date(a.created_at)
        })

    return (
    <div className="max-w-7xl mx-auto p-6 text-white">
        <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6">Recipes</h1>

            <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => setShowAI(true)}
                  className="
                    px-6 py-3 rounded-xl
                    bg-gradient-to-r from-emerald-500 to-green-500
                    hover:from-emerald-600 hover:to-green-600
                    font-semibold shadow-lg
                    transition transform hover:scale-105"
                >
                ✨ Generate Recipe with AI
                </button>

              <button
                onClick={() => setShowManualInput(true)}
                className="
                px-6 py-3 rounded-xl
                bg-blue-500 hover:bg-blue-600
                font-semibold shadow-lg
                transition transform hover:scale-105
              "
            >
              ➕ Add Recipe Manually
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search recipes by title..."
              value={searchbar}
              onChange={(e) => setSearchbar(e.target.value)}
              className="
                w-full rounded-xl
                bg-white/10 backdrop-blur-xl
                border border-white/30
                px-5 py-3 pl-12
                text-white placeholder-white/60
                focus:outline-none focus:ring-2 focus:ring-[#FF7582]
              "
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
            <p className="mt-4 text-white/60">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-white/60 mb-4">
              {searchbar ? "No recipes found matching your search" : "No recipes yet"}
            </p>
            <p className="text-white/40">
              {searchbar ? "Try a different search term" : "Create your first recipe to get started!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={viewRecipe}
              />
            ))}
          </div>
        )}

        {showManualInput && (
          <ManualRecipe
            onClose={() => setShowManualInput(false)}
            onRecipeCreated={createdRecipe}
          />
        )}

        {showAI && (
          <AIRecipeModal
            onClose={() => setShowAI(false)}
            onRecipeCreated={createdRecipe}
          />
        )}

        {showDetail && selected && (
          <RecipeDetail
            recipe={selected}
            onClose={() => setShowDetail(false)}
            onRecipeUpdated={updatedRecipe}
            onRecipeDeleted={deletedRecipe}
          />
        )}
      </div>
  )
}

export default Recipes