import cors from "cors"
import express from "express"
import authRoutes from "./modules/auth/auth.routes"
import cookieParser from "cookie-parser"
import env from "./config/env"

const app = express()
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes)



export default app