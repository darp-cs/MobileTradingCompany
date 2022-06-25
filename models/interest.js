const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchlist = new Schema({
    uname:{type: Schema.Types.ObjectId, ref: 'User'},
    mnames:[{type: Schema.Types.ObjectId, ref: 'Mobile'}],
    }
);

module.exports = mongoose.model('WatchList', watchlist);