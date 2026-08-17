import { useState } from "react"
import api from "../../api"
import { useNavigate } from "react-router-dom"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants"
import { useEffect } from "react"


function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN)

    if (token) {
      navigate("/home")
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      const res = await api.post("/api/token/", { username, password })
      localStorage.setItem(ACCESS_TOKEN, res.data.access)
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh)

      const profileRes = await api.get("/api/profile/status/")
      profileRes.data.has_profile
        ? navigate("/home")
        : navigate("/profile-setup")
    } catch (err) {
      setErrorMessage("Invalid username or password", err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
<div className="min-h-screen flex items-center justify-center px-4">
    <form
      onSubmit={handleSubmit}
      className="
        w-full max-w-md
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
        Welcome back
      </h1>

      <p className="text-sm text-white/80 text-center">
        Log in to continue tracking your nutrition
      </p>

      <div className="space-y-4">

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="
            w-full rounded-xl
            bg-black/30
            border border-white/30
            px-4 py-3
            text-sm text-white
            placeholder-white/60
            focus:outline-none
            focus:ring-2
            focus:ring-[#FF7582]
          "
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full rounded-xl
            bg-black/30
            border border-white/30
            px-4 py-3
            text-sm text-white
            placeholder-white/60
            focus:outline-none
            focus:ring-2
            focus:ring-[#FF7582]
          "
        />

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


      <button
        type="submit"
        disabled={loading}
        className="
          w-full rounded-xl
          bg-[#FF7582]
          py-3
          font-semibold
          shadow-xl shadow-[#FF7582]/30
          hover:bg-[#ff5c6b]
          transition
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
          {loading ? "Logging in.." : "Login"}
      </button>
    </form>
  </div>
  )
}

export default Login
