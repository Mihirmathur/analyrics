/**
 * Created by mitrikyle on 5/6/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArtistSchema = new Schema({
    name: String,
    top_tracks: [String],
    words: [{
        word: String,
        frequency: Number
    }],
    lyrics: String,
    x: [String],
    y: [Number]
});

// return the model

module.exports = mongoose.model('Artist', ArtistSchema);


