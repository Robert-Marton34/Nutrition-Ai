import { Outlet } from "react-router-dom"
import { Footer } from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#355C7D] via-[#725A7A] to-[#C56C86] text-white">
      <div className="min-h-screen bg-black/20 backdrop-blur-md">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

