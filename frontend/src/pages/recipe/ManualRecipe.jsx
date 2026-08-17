import { useState } from "react"
import api from "../../api"

function ManualRecipe({onClose, onRecipeCreated}) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [servings, setServings] = useState("")
    const [total_time_minutes, setTotalTimeMinutes] = useState("")
    const [calories_per_serving, setCaloriesPerServing] = useState("")
    const [protein_per_serving, setProteinPerServing] = useState("")
    const [carbs_per_serving, setCarbsPerServing] = useState("")
    const [fats_per_serving, setFatsPerServing] = useState("")
    const [ingredients, setIngredients] = useState([""])
    const [instructions, setInstructions] = useState([""])
    const [source] = useState("manual")
    const [saving, setSaving] = useState(false)

    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImage(null)
        setImagePreview(null)
    }
    const submitRecipe = async (e) => {
        e.preventDefault()

        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('description', description)
            formData.append('servings', Number(servings))
            formData.append('total_time_minutes', Number(total_time_minutes) || '')
            formData.append('ingredients', JSON.stringify(ingredients.filter(i => i.trim())))
            formData.append('instructions', JSON.stringify(instructions.filter(i => i.trim())))
            formData.append('calories_per_serving', Number(calories_per_serving))
            formData.append('protein_per_serving', Number(protein_per_serving) || '')
            formData.append('carbs_per_serving', Number(carbs_per_serving) || '')
            formData.append('fats_per_serving', Number(fats_per_serving) || '')
            formData.append('source', source)
            
            if (image) {
                formData.append('image', image)
            }

            await api.post("/api/recipes/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            onRecipeCreated()
        } catch (err) {
            console.error("Failed to create recipe:", err)
        } finally {
            setSaving(false) 
        }
    }
    const addIngredient = () => setIngredients([...ingredients, ""])
    const removeIngredient = (idx) => setIngredients(ingredients.filter((_, i) => i !== idx))
    const updateIngredient = (idx, value) => {
        const updated = [...ingredients]
        updated[idx] = value
        setIngredients(updated)
    }

    const addInstruction = () => setInstructions([...instructions, ""])
    const removeInstruction = (idx) => setInstructions(instructions.filter((_, i) => i !== idx))
    const updateInstruction = (idx, value) => {
        const updated = [...instructions]
        updated[idx] = value
        setInstructions(updated)
    }

    const inputStyle = "w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#FF7582]"

    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-gradient-to-br from-[#355C7D]/95 via-[#725A7A]/95 to-[#C56C86]/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 bg-black/30 backdrop-blur-xl border-b border-white/20 p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add Recipe Manually</h2>
                <button onClick={onClose} className="text-white/60 hover:text-white text-3xl">×</button>
            </div>
        </div>

        <form onSubmit={submitRecipe} className="p-6 space-y-6">
            <div>
                <label className="block text-sm mb-2 text-white/70">Recipe Image (Optional)</label>
                
                {imagePreview ? (
                    <div className="relative">
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-64 object-cover rounded-xl"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
                        >
                            ×
                        </button>
                    </div>
                ) : (
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
                )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm mb-1 text-white/70">Recipe Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={inputStyle}
                        placeholder="e.g., Chicken Stir-Fry"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-white/70">Servings *</label>
                    <input
                        type="number"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className={inputStyle}
                        placeholder="e.g., 4"
                        min="1"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm mb-1 text-white/70">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputStyle + " min-h-[80px]"}
                    placeholder="Brief description of the recipe..."
                />
            </div>

            <div>
                <label className="block text-sm mb-1 text-white/70">Total Time (minutes)</label>
                <input
                    type="number"
                    value={total_time_minutes}
                    onChange={(e) => setTotalTimeMinutes(e.target.value)}
                    className={inputStyle}
                    placeholder="e.g., 30"
                    min="1"
                />
            </div>


            <div>
                <h3 className="font-semibold mb-3">Nutrition per Serving</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1 text-white/70">Calories *</label>
                        <input
                            type="number"
                            value={calories_per_serving}
                            onChange={(e) => setCaloriesPerServing(e.target.value)}
                            className={inputStyle}
                            placeholder="e.g., 450"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-white/70">Protein (g)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={protein_per_serving}
                            onChange={(e) => setProteinPerServing(e.target.value)}
                            className={inputStyle}
                            placeholder="e.g., 30"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-white/70">Carbs (g)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={carbs_per_serving}
                            onChange={(e) => setCarbsPerServing(e.target.value)}
                            className={inputStyle}
                            placeholder="e.g., 45"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-white/70">Fats (g)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={fats_per_serving}
                            onChange={(e) => setFatsPerServing(e.target.value)}
                            className={inputStyle}
                            placeholder="e.g., 15"
                            min="0"
                        />
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Ingredients</h3>
                    <button
                        type="button"
                        onClick={addIngredient}
                        className="text-sm px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg transition"
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
                                placeholder="e.g., 2 cups rice"
                            />
                            {ingredients.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeIngredient(idx)}
                                    className="px-3 bg-red-500 hover:bg-red-600 rounded-lg transition"
                                >
                                ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Instructions</h3>
                    <button
                        type="button"
                        onClick={addInstruction}
                        className="text-sm px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg transition"
                    >
                    + Add
                    </button>
                </div>
                <div className="space-y-2">
                    {instructions.map((instruction, idx) => (
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
                        {instructions.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeInstruction(idx)}
                                className="px-3 bg-red-500 hover:bg-red-600 rounded-lg transition h-fit mt-2"
                            >
                            ×
                            </button>
                        )}
                        </div>
                    ))}
                </div>
            </div>


            <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 font-semibold transition"
                    >
                    Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-3 rounded-xl bg-[#FF7582] hover:bg-[#ff5c6b] font-semibold transition disabled:opacity-50"
                    >
                    {saving ? "Creating..." : "Create Recipe"}
                    </button>
            </div>
        </form>
        </div>
    </div>
  )
}
export default ManualRecipe