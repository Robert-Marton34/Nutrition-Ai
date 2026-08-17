import {Navigate, ServerRouter} from "react-router-dom"
import {jwtDecode} from "jwt-decode"
import api from "../api"
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"
import { useState, useEffect } from "react";

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null)

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false))
    }, [])

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if (!token) {
            setIsAuthorized(false)
            return
        }

        const decoded = jwtDecode(token)
        const now = Date.now() / 1000

        if (decoded.exp < now) {
            //Token expired try to refresh before deciding
            const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN)
            if (!storedRefreshToken) {
                setIsAuthorized(false)
                return
            }
            try {
                const res = await api.post("/api/token/refresh/", {
                    refresh: storedRefreshToken,
                })
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                setIsAuthorized(true)
            } catch {
                localStorage.clear()
                setIsAuthorized(false)
            }
        } else {
            setIsAuthorized(true)
        }
    }

    if (isAuthorized === null) {
        return <div>Loading...</div>
    }

    return isAuthorized ? children : <Navigate to="/login" />
}

export default ProtectedRoute
