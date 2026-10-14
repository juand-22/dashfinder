import cors from "cors"
import express from "express"
import authRoutes from "./modules/auth/auth.routes"
import env from "./config/env"

const app = express()
app.use(cors({ origin: env.FRONTEND_URL }))
app.use(express.json())


app.use("/api/auth", authRoutes)



export default app