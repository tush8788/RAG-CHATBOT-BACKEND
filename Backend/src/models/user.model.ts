import UserSchema from '../schema/user.schema'
const getUserFromEmail = async (email:string) => {
    return UserSchema.findOne({email:email})
}

const createUser = async (email:string,name:string,profileImage:string) => {
    return UserSchema.create({
        name,
        email,
        profileImage
    })
}

const getUserFromId = async (id:string) => {
    return UserSchema.findById(id)
}

export default {
    getUserFromEmail,
    createUser,
    getUserFromId
}