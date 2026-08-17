import React from "react"
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProfileSetup from "./pages/ProfileSetup"
import ProtectedRoute from "./components/ProtectedRoute"
import LandingPage from "./pages/LandingPage"
import Layout from "./components/Layout"
import LayoutSigned from "./components/LayoutSigned"
import Profile from "./pages/Profile"
import Recipes from "./pages/Recipes"
import FoodAnalyzer from "./pages/FoodAnalyzer"

function Logout() {
  localStorage.clear()
  return <Navigate to="/" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path = "/" element = {<LandingPage/>} />
          <Route path = "/logout" element = {<Logout/> }/>
          <Route path = "/login" element = {<Login/> }/>
          <Route path = "/register" element = {<Register/> }/>
          <Route path = "*" element = {<NotFound/> }/>
          <Route path= "/profile-setup" element={<ProtectedRoute> <ProfileSetup /> </ProtectedRoute>} />
        </Route>
        <Route element={<LayoutSigned />}>
          <Route path = "/home" element = {<ProtectedRoute> <Home/> </ProtectedRoute>}/>
          <Route path = "/recipes" element = {<ProtectedRoute> <Recipes/> </ProtectedRoute>}/>
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><FoodAnalyzer /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
