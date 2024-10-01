// models/order.js
const mongoose = require('mongoose');

const sarahaSchema = new mongoose.Schema({
    uid: { type: mongoose.Schema.Types.Mixed, required: true },
    message: { type: String, required: true },
    username: { type: String, required: true },
    date: { type: String, required: true },
    numberToOrderBy: { type: Number, required: true }
});
  
const Saraha = mongoose.model('Saraha', sarahaSchema);
  
module.exports = Saraha;
  