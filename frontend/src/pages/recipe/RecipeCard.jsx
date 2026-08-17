function RecipeCard({ recipe, onView }) {
  const BASE_URL = "http://127.0.0.1:8000"

  const imageUrl = recipe.image
    ? recipe.image.startsWith("http")
      ? recipe.image
      : `${BASE_URL}${recipe.image}`
    : null
  return (
    <div className="
      bg-white/10 backdrop-blur-xl rounded-2xl
      border border-white/20
      overflow-hidden shadow-xl
      hover:shadow-2xl hover:scale-105
      transition-all duration-300
    ">
      {/* Recipe Image */}
      {imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={recipe.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
            console.error("Image failed:", e.target.src)
          }}
          />
          {recipe.is_favorite && (
            <span className="absolute top-3 right-3 text-yellow-400 text-3xl drop-shadow-lg">⭐</span>
          )}
        </div>
      ) : (
        <div className="relative h-48 bg-gradient-to-br from-[#355C7D] to-[#C56C86] flex items-center justify-center">
          <span className="text-8xl opacity-50">🍽️</span>
          {recipe.is_favorite && (
            <span className="absolute top-3 right-3 text-yellow-400 text-3xl drop-shadow-lg">⭐</span>
          )}
        </div>
      )}

      {/* Recipe Details */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">
          {recipe.title}
        </h3>

        <div className="space-y-2 mb-4 text-sm">
          {recipe.total_time_minutes && (
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{recipe.total_time_minutes} min</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-white/80">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <span>{recipe.calories_per_serving/recipe.servings} cal/serving</span>
          </div>

          {recipe.source && (
            <div className="flex items-center gap-2">
              <span className={`
                px-2 py-1 rounded-full text-xs font-semibold
                ${recipe.source === 'ai_generated' 
                  ? 'bg-purple-500/30 text-purple-200' 
                  : 'bg-blue-500/30 text-blue-200'}
              `}>
                {recipe.source === 'ai' ? '🤖 AI Generated' : '📝 Manual'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => onView(recipe)}
          className="
            w-full py-2 rounded-xl
            bg-[#FF7582] hover:bg-[#ff5c6b]
            font-semibold
            transition
          "
        >
          View Recipe
        </button>
      </div>
    </div>
  )
}

export default RecipeCard