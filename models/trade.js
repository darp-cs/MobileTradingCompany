const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trade = new Schema({
    traderid:{type: Schema.Types.ObjectId, ref: 'User'},
    tradeid:{type: Schema.Types.ObjectId, ref: 'Mobile'},
    offerid:{type: Schema.Types.ObjectId, ref: 'Mobile'}
}
);

module.exports = mongoose.model('Trade', trade);