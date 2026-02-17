import { connectDB } from "./DB/connectDB.js"
import { globalErrorHandling } from "./utils/ressponse/error.response.js"
import authController from "./modules/auth/auth.controller.js"
import userController from "./modules/user/user.controller.js"
import path from "node:path"
export const bootstrap = (app, express) => {
    app.use(express.json())
    app.use("/upload",express.static(path.resolve("./src/upload")))
    app.use("/auth", authController)
    app.use("/user", userController)
    app.get('/', (req, res) => res.send('Hello World!'))

    app.use(globalErrorHandling)
    connectDB()
}