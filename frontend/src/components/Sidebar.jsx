import { NavLink, useNavigate } from "react-router-dom"
import { Home, User, Utensils, LogOut, CameraIcon } from "lucide-react"

export default function Sidebar() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    navigate("/")
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition
     ${
       isActive
         ? "bg-[#FF7582] text-white shadow-lg"
         : "text-white/70 hover:bg-white/10"
     }`

  return (
      <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#355C7D] via-[#725A7A] to-[#C56C86] p-6 flex flex-col">

      <h1 className="text-xl font-bold text-white mb-10">
        NutriAI
      </h1>

      <nav className="space-y-2 flex-1">

        <NavLink to="/home" className={linkClass}>
          <Home size={20} />
          Home
        </NavLink>

        <NavLink to="/recipes" className={linkClass}>
          <Utensils size={20} />
          Recipes
        </NavLink>

        <NavLink to="/profile" className={linkClass}>
          <User size={20} />
          Profile
        </NavLink>

        <NavLink to="/scanner" className={linkClass}>
          <CameraIcon size={20} />
          Analyzer
        </NavLink>

      </nav>

      <button
        onClick={logout}
        className="
          flex items-center gap-3
          text-white/70 hover:text-white
          px-4 py-3 rounded-xl
          hover:bg-red-500/20
          transition
        "
      >
        <LogOut size={20} />
        Logout
      </button>

    </aside>
  )
}
