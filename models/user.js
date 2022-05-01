const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose)
//adds username, hash and salt fields

module.exports = mongoose.model('User', UserSchema)