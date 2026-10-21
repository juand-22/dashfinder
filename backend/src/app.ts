import cors from "cors"
import express from "express"
import authRoutes from "./modules/auth/auth.routes"
import findRoutes from "./modules/find/find.routes"
import modRoutes from "./modules/mod/mod.routes"
import serversRoutes from "./modules/servers/servers.routes"
import cookieParser from "cookie-parser"
import dehashRouter from "./modules/dehash/dehash.routes"
import env from "./config/env"

const app = express()
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/find", findRoutes)
app.use("/api/mod", modRoutes)
app.use("/api/servers", serversRoutes)
app.use("/api/dehash", dehashRouter)



export default app