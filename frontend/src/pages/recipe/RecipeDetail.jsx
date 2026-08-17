import { useState } from "react"
import api from "../../api"

function RecipeDetail({recipe, onClose, onRecipeUpdated, onRecipeDeleted}){
    const [isEditing, setIsEditing] = useState(false)
    const [editedRecipe, setEditedRecipe] = useState({...recipe})
    const [saving, setSaving] = useState(false)

    const [editIngredients, setEditIngredients] = useState([...(recipe.ingredients || [])])
    const [editInstructions, setEditInstructions] = useState([...(recipe.instructions || [])])

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const [newImage, setNewImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [removeExistingImage, setRemoveExistingImage] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const toggleFavorite = async () => {
        try {
            const formData = new FormData()
            formData.append('is_favorite', !editedRecipe.is_favorite)

            const res = await api.patch(`/api/recipes/${recipe.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            setEditedRecipe(res.data)
            onRecipeUpdated()
        } catch (err) {
            console.error("Failed to toggle favorite:", err)
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setNewImage(file)
            setRemoveExistingImage(false)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setNewImage(null)
        setImagePreview(null)
        setRemoveExistingImage(true)
    }

    const handleSave = async () => {
        if (
            !editedRecipe.title?.trim() ||
            !editedRecipe.servings ||
            !editedRecipe.calories_per_serving
        ) {
            setErrorMessage("Title, servings and calories are required")
            return
        }
        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('title', editedRecipe.title || '')
            formData.append('description', editedRecipe.description || '')
            formData.append('servings', Number(editedRecipe.servings) || 1)
            formData.append('total_time_minutes', Number(editedRecipe.total_time_minutes) || '')
            formData.append('calories_per_serving', Number(editedRecipe.calories_per_serving) || 0)
            formData.append('protein_per_serving', Number(editedRecipe.protein_per_serving) || '')
            formData.append('carbs_per_serving', Number(editedRecipe.carbs_per_serving) || '')
            formData.append('fats_per_serving', Number(editedRecipe.fats_per_serving) || '')
            formData.append('is_favorite', editedRecipe.is_favorite)
            formData.append('ingredients', JSON.stringify(editIngredients.filter(i => i.trim())))
            formData.append('instructions', JSON.stringify(editInstructions.filter(i => i.trim())))
          
            if (newImage) {
                formData.append('image', newImage)
            } else if (removeExistingImage) {
                formData.append('image', '') 
            }

            const res = await api.patch(`/api/recipes/${recipe.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            setEditedRecipe(res.data)
            setNewImage(null)
            setImagePreview(null)
            onRecipeUpdated()
            setIsEditing(false)
        } catch (err) {
            console.error("Failed to update recipe:", err)
            alert("Failed to save changes. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {

        try {
            await api.delete(`/api/recipes/${recipe.id}/`)
            setShowDeleteConfirm(false)
            onRecipeDeleted()
        } catch (err) {
            console.error("Failed to delete recipe:", err)
        }
    }

    const handleCancelEdit = () => {
        setEditedRecipe({...recipe})
        setEditIngredients([...(recipe.ingredients || [])])
        setEditInstructions([...(recipe.instructions || [])])
        setNewImage(null)
        setImagePreview(null)
        setRemoveExistingImage(false)
        setIsEditing(false)
    }

    const addIngredient = () => setEditIngredients([...editIngredients, ""])
    const removeIngredient = (idx) => setEditIngredients(editIngredients.filter((_, i) => i !== idx))
    const updateIngredient = (idx, value) => {
        const updated = [...editIngredients]
        updated[idx] = value
        setEditIngredients(updated)
    }

    const addInstruction = () => setEditInstructions([...editInstructions, ""])
    const removeInstruction = (idx) => setEditInstructions(editInstructions.filter((_, i) => i !== idx))
    const updateInstruction = (idx, value) => {
        const updated = [...editInstructions]
        updated[idx] = value
        setEditInstructions(updated)
    }

    const inputStyle = "w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF7582]"

    const getImageUrl = (img) => {
        if (!img) return null
        if (img.startsWith('http')) return img 
        return `http://127.0.0.1:8000${img}` 
    }
    const currentImage = imagePreview || (!removeExistingImage && getImageUrl(editedRecipe.image))

    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#355C7D]/95 via-[#725A7A]/95 to-[#C56C86]/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 bg-black/30 backdrop-blur-xl border-b border-white/20 p-6 z-20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedRecipe.title}
                  onChange={(e) => setEditedRecipe({ ...editedRecipe, title: e.target.value })}
                  className="text-2xl font-bold bg-white/10 border border-white/30 rounded-lg px-3 py-2 w-full text-white"
                  placeholder="Recipe title..."
                />
              ) : (
                <h2 className="text-3xl font-bold">{editedRecipe.title}</h2>
              )}
            </div>

            <button
              onClick={onClose}
              className="ml-4 text-white/60 hover:text-white text-3xl"
            >
              ×
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={toggleFavorite}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                editedRecipe.is_favorite
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {editedRecipe.is_favorite ? '⭐ Favorited' : '☆ Favorite'}
            </button>

            {isEditing ? (
              <>
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
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 font-semibold transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 font-semibold transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 font-semibold transition"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 relative z-10">
          {/* Image */}
          <div className="relative z-0">
            <h3 className="text-lg font-semibold mb-2">Recipe Image</h3>
            
            {currentImage ? (
              <div className="relative group">
                <img 
                  src={currentImage} 
                  alt={editedRecipe.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm text-white rounded-lg px-3 py-2 flex items-center gap-2 font-semibold transition shadow-lg hover:shadow-xl group"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-sm">Remove</span>
                    </button>

                    <label className="absolute bottom-3 right-3 bg-blue-500/90 hover:bg-blue-600 backdrop-blur-sm text-white rounded-lg px-3 py-2 flex items-center gap-2 font-semibold transition shadow-lg hover:shadow-xl cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Replace</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            ) : isEditing ? (
              <label className="block w-full h-64 border-2 border-dashed border-white/30 rounded-xl hover:border-[#FF7582] transition cursor-pointer">
                <div className="h-full flex flex-col items-center justify-center text-white/60 hover:text-white/80">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Click to upload image</p>
                  <p className="text-xs mt-1">PNG, JPG up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-[#355C7D] to-[#C56C86] rounded-xl flex items-center justify-center">
                <span className="text-8xl opacity-50">🍽️</span>
              </div>
            )}
          </div>
          
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={editedRecipe.description}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, description: e.target.value })}
                className={inputStyle + " min-h-[80px]"}
                placeholder="Recipe description..."
              />
            ) : (
              <p className="text-white/80">{editedRecipe.description || "No description"}</p>
            )}
          </div>

          {/* Quick Info  */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Servings</p>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  value={editedRecipe.servings}
                  onChange={(e) => setEditedRecipe({ ...editedRecipe, servings: e.target.value })}
                  className="text-2xl font-bold bg-white/10 border border-white/30 rounded px-2 py-1 w-full text-white"
                />
              ) : (
                <p className="text-2xl font-bold">{editedRecipe.servings}</p>
              )}
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Time (min)</p>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={editedRecipe.total_time_minutes || ""}
                  onChange={(e) => setEditedRecipe({ ...editedRecipe, total_time_minutes: e.target.value })}
                  className="text-2xl font-bold bg-white/10 border border-white/30 rounded px-2 py-1 w-full text-white"
                  placeholder="0"
                />
              ) : (
                <p className="text-2xl font-bold">{editedRecipe.total_time_minutes || "—"}</p>
              )}
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60 text-sm">Calories</p>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={editedRecipe.calories_per_serving}
                  onChange={(e) => setEditedRecipe({ ...editedRecipe, calories_per_serving: e.target.value })}
                  className="text-2xl font-bold bg-white/10 border border-white/30 rounded px-2 py-1 w-full text-white"
                />
              ) : (
                <p className="text-2xl font-bold">{editedRecipe.calories_per_serving}</p>
              )}
            </div>

            {editedRecipe.source && (
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-sm">Source</p>
                <p className="text-sm font-bold">
                  {editedRecipe.source === 'ai' ? '🤖 AI' : '📝 Manual'}
                </p>
              </div>
            )}
          </div>

          {/* Macros */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Macros per Serving</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white/60 text-sm">Protein (g)</p>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editedRecipe.protein_per_serving || ""}
                    onChange={(e) => setEditedRecipe({ ...editedRecipe, protein_per_serving: e.target.value })}
                    className="text-xl font-bold bg-white/10 border border-white/30 rounded px-2 py-1 w-full text-white text-center"
                    placeholder="0"
                  />
                ) : (
                  <p className="text-xl font-bold">{editedRecipe.protein_per_serving || "—"}</p>
                )}
              </div>

              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white/60 text-sm">Carbs (g)</p>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editedRecipe.carbs_per_serving || ""}
                    onChange={(e) => setEditedRecipe({ ...editedRecipe, carbs_per_serving: e.target.value })}
                    className="text-xl font-bold bg-white/10 border border-white/30 rounded px-2 py-1 w-full text-white text-center"
                    placeholder="0"
                  />
                ) : (
                  <p className="text-xl font-bold">{editedRecipe.carbs_per_serving || "—"}</p>
                )}
              </div>

              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white/60 text-sm">Fats (g)</p>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editedRecipe.fats_per_serving || ""}
                    onChange={(e) => setEditedRecipe({ ...editedRecipe, fats_per_serving: e.target.value })}
                    className="text-xl font-bold bg-white/10 border border-white/30 rounded px-2 py-1 w-full text-white text-center"
                    placeholder="0"
                  />
                ) : (
                  <p className="text-xl font-bold">{editedRecipe.fats_per_serving || "—"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Ingredients</h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm px-3 py-1 bg-[#FF7582] hover:bg-[#ff5c6b] rounded-lg transition"
                >
                  + Add
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                {editIngredients.map((ingredient, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateIngredient(idx, e.target.value)}
                      className={inputStyle}
                      placeholder="e.g., 2 cups rice"
                    />
                    {editIngredients.length > 1 && (
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
            ) : (
              Array.isArray(editedRecipe.ingredients) && editedRecipe.ingredients.length > 0 ? (
                <ul className="space-y-2">
                  {editedRecipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-white/80">
                      <span className="text-[#FF7582] mt-1">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/60 italic">No ingredients listed</p>
              )
            )}
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Instructions</h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-sm px-3 py-1 bg-[#FF7582] hover:bg-[#ff5c6b] rounded-lg transition"
                >
                  + Add
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                {editInstructions.map((instruction, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="bg-[#FF7582] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-2">
                      {idx + 1}
                    </span>
                    <textarea
                      value={instruction}
                      onChange={(e) => updateInstruction(idx, e.target.value)}
                      className={inputStyle + " min-h-[60px] flex-1"}
                      placeholder="e.g., Heat oil in a pan..."
                    />
                    {editInstructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(idx)}
                        className="px-3 bg-red-500 hover:bg-red-600 rounded-lg transition h-fit mt-2 text-white"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              Array.isArray(editedRecipe.instructions) && editedRecipe.instructions.length > 0 ? (
                <ol className="space-y-3">
                  {editedRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-white/80">
                      <span className="bg-[#FF7582] rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-white/60 italic">No instructions provided</p>
              )
            )}
          </div>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="bg-gradient-to-br from-[#355C7D] via-[#725A7A] to-[#C56C86] rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-xl">

            <h3 className="text-xl font-bold mb-3">
              Delete Recipe?
            </h3>

            <p className="text-white/80 mb-6">
              Are you sure you want to delete <b>{recipe.title}</b>?  
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default RecipeDetail