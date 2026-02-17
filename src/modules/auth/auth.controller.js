import { Router } from "express";
import * as authService from "./auth.service.js"
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./auth.validation.js"
const router = Router()

router.post("/signup", validation(validators.signup), authService.signup)
router.patch("/confirmEmail", validation(validators.confirmEmail), authService.confirmEmail)
router.post("/login", validation(validators.login), authService.login)
router.get("/refreshToken", authService.refreshToken)
router.post("/loginWithGmail", authService.loginWithGmail)
router.patch("/forgotPassword", validation(validators.forgotPassword), authService.forgotPassword)
router.patch("/verifyForgotPassword", validation(validators.verifyForgotPassword), authService.verifyForgotPassword)
router.patch("/resetPassword", validation(validators.resetPassword), authService.resetPassword)

export default router