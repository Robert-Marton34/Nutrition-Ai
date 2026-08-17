import axios from "axios"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000"
})

//REQUEST interceptor attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

//RESPONSE interceptor catch 401s, refresh, and retry
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error)
        } else {
            promise.resolve(token)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,  //pass successful responses straight through
    async (error) => {
        const originalRequest = error.config

        //Only handle 401s, and don't retry if we already retried once
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }

        //Don't try to refresh if the failing request is the refresh endpoint
        if (originalRequest.url?.includes("/api/token/refresh/")) {
            localStorage.clear()
            window.location.href = "/login"
            return Promise.reject(error)
        }

        //If a refresh in progress, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return api(originalRequest)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN)

        if (!storedRefreshToken) {
            localStorage.clear()
            window.location.href = "/login"
            return Promise.reject(error)
        }

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/token/refresh/`,
                { refresh: storedRefreshToken }
            )

            const newToken = res.data.access
            localStorage.setItem(ACCESS_TOKEN, newToken)

            //Retry all queued requests with the new token
            processQueue(null, newToken)

            //Retry the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)

        } catch (refreshError) {
            processQueue(refreshError, null)
            localStorage.clear()
            window.location.href = "/login"
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)

export default api