import { useState } from "react"
import api from "../../api"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { ACCESS_TOKEN } from "../../constants"


function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
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

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      await api.post("/api/user/register/", {
        username,
        email,
        password,
      })

      navigate("/login")
    } catch (error) {
        setErrorMessage(error.response?.data?.detail || error.response?.data?.username?.[0] || "Registration failed")
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
          Create your account
        </h1>

        <p className="text-sm text-white/80 text-center">
          Start tracking calories and nutrition today
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  )
}

export default Register