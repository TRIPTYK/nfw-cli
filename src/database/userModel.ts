import mongoose = require('mongoose');
import { IUser } from '../utils/interfaces'
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    firstname: {
        type: String, 
        required: true
    },
    lastname: { 
        type: String, 
        required: true
    },
    role: { 
        type: String, 
        required: true
    },
    username: { 
        type: String, 
        required: true
    },
    password: {
        type: String, 
        required: true
    }
}, { collection: 'user'});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;