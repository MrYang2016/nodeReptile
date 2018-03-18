const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = mongoose.model('movieList', new Schema({
    src: String,
    index: String,
    imgSrc: String,
    title: String,
    performer: String,
    rating: String,
    eva: String,
    quote: String
}))