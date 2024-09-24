const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const purchaseSchema = new Schema({
    id: ObjectId,
    userId: {
        type: ObjectId,
        required: true,
        ref: 'user'
    },
    courseId: {
        type: ObjectId,
        required: true,
        ref: 'course'
    },
    purchaseTime: {
        type: Date,
        default: Date.now
    }
});

const purchaseModel = mongoose.model('purchase', purchaseSchema);

module.exports = purchaseModel;