import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        isUnique:true
    },
    profileImage:{
        type:String
    }
},{
    timestamps:true
})

const User = mongoose.model('User',userSchema);

export default User;