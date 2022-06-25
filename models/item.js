const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mobileSchema = new Schema({
    name: {type: String, required: [true, 'Name is required']},
    company: {type: String, required: [true, 'Company is required']},
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    battery: {type: String, required: [true, 'Battery details is required']},
    details: {type: String, required: [true, 'Details os required'],
              minLength: [10, 'The detail should have at least 10 characters']},
    memory: {type: String, required: [true, 'Memory details is required']}, 
    image: {type: String, required: [true, 'Image details is required']},
    color: {type: String, required: [true, 'Color details is required']},
    createAt: {type: String, required: [true, 'Date is required']},
    status: { type: String, required: [true]}
    },
    {timestamps: true}
);

module.exports = mongoose.model('Mobile', mobileSchema);