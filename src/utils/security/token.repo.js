import { userModel } from "../../modules/User.schema.js"

export const findOne = async ({ filter = {} } = {}) => {
    return await userModel.findOne(filter)
}