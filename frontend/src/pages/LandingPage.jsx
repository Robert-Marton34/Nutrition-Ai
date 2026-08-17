import { Link, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { ACCESS_TOKEN } from "../constants"

export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN)

    if (token) {
      navigate("/home")
    }
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center">

        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          Calorie & Nutrition Tracker
        </h1>

        <p className="text-white/80 mb-10 leading-relaxed">
          Track your daily calories, monitor nutrition, and receive
          personalized meal recommendations tailored to your goals.
        </p>

        <div className="flex justify-center gap-4">

          <Link
            to="/login"
            className="
              px-8 py-3 rounded-xl
              bg-[#FF7582]
              hover:bg-[#ff5c6b]
              transition
              font-semibold
              shadow-xl shadow-[#FF7582]/30
            "
          >
            Login
          </Link>

          <Link
            to="/register"
            className="
              px-8 py-3 rounded-xl
              border border-white/30
              text-white/90
              hover:bg-white/10
              backdrop-blur
              transition
              font-semibold
            "
          >
            Register
          </Link>

        </div>

      </div>
    </div>
  )
}
