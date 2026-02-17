import { userModel } from "../../modules/User.schema.js"

export const updateOne = async ({ filter = {}, data = {} } = {}) => {
    return await userModel.updateOne(filter, data)
}