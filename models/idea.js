const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: String,
    description: String,
    // medium: [
    //     {
    //         type: String
    //     }
    // ],
    //in the future, want a boolean option. so we can query and categorize stuff better.

    contact: String,
    
});

module.exports = mongoose.model('Idea', ideaSchema)


