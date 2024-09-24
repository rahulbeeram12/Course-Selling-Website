const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const courseSchema = new Schema({
    id: ObjectId,
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    price: {
        type: String,
        required: true
    },
    creatorId: {
        type: ObjectId,
        required: true,
        ref: 'creator'
    },
    validity: {
        // in days
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    users: {
        type: [ObjectId],
        required: true,
        ref: 'user'
    }
});

const courseModel = mongoose.model('course', courseSchema);

module.exports = courseModel;