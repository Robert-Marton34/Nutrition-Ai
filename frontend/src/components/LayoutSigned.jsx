import { Outlet } from "react-router-dom"
import Sidebar from "./SideBar"

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
