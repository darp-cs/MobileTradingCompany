const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchlist = new Schema({
    uid:{type: Schema.Types.ObjectId, ref: 'User'},
    mobiles:[{type: Schema.Types.ObjectId, ref: 'Mobile'}],
    }
);

module.exports = mongoose.model('FollowList', watchlist);
