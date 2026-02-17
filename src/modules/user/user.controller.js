import { Router } from "express";
import { authentication, authorization } from "../../middleware/authentication.middleware.js";
import * as userService from "./user.service.js"
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js"
import { fileValidations, uploadDiskFile } from "../../utils/multer/local.multer.js";
const router = Router()

router.get(
    "/profile",
    authentication(),
    userService.profile
)
router.get(
    "/shareProfile/:profileId",
    validation(validators.shareProfile),
    authentication(),
    userService.shareProfile
)
router.patch(
    "/updateEmail",
    validation(validators.updateEmail),
    authentication(),
    userService.updateEmail
)
router.patch(
    "/resetEmail",
    validation(validators.resetEmail),
    authentication(),
    userService.resetEmail
)
router.patch(
    "/updatePassword",
    validation(validators.updatePassword),
    authentication(),
    userService.updatePassword
)
router.patch(
    "/updateProfile",
    validation(validators.updateProfile),
    authentication(),
    userService.updateProfile
)

router.patch(
    "/profile/uploadImageDisk",
    authentication(),
    uploadDiskFile("user", fileValidations.image).single("attachments"),
    validation(validators.uploadImageDisk),
    userService.uploadImageDisk
)
router.patch(
    "/profile/uploadCoverDisk",
    authentication(),
    uploadDiskFile("user/cover", fileValidations.image).array("attachments", 3),
    // validation(validators.uploadImageDisk),
    userService.uploadCoverDisk
)


export default router