var express = require('express');
var http  = require('http');
var app = express();
var scraperjs = require('scraperjs');
var _ = require('underscore');
music = require('musicmatch')({usertoken:"e47147db0be71452d008844e1aa9185c",format:"",appid:""});

//This function relates each word with its frequency.
function count(arr){
	return arr.reduce(function(m,e){
		m[e] = (+m[e]||0)+1; return m
	},{});
}

app.set('view engine', 'ejs');

app.get('/', function(req, res){
	res.render('index', {'title': 'Analyrics'});
	// if(req.method == 'POST'){
	// 	console.log(req.body.artist);
	// }
});

app.get('/:artist?/:name?', function(req, res){
	var name = req.params.name;
	var artist = req.params.artist;
	music.trackSearch({q:name, q_artist:artist})
	.then(function(data){
		//console.log(data);
		var track_l = data.message.body.track_list;
		trackID = track_l[0].track.track_id;

		music.trackLyrics({track_id: trackID})
		.then(function(data){
			//console.log(data.message.body.lyrics.lyrics_body);
			var lyrics = data.message.body.lyrics.lyrics_body;
			//lyrics = lyrics.replace("\n", "<br />");
			//console.log(lyrics);
			//lyrics.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
			var lyr = lyrics.split(/ |\n/);
			var lyr_sorted = [];
			for (var i = 0; i < lyr.length; i++) {
				lyr_sorted.push(lyr[i].replace(/[^a-zA-Z]/g, "").toLowerCase());
			}
			lyr_sorted.sort();
			var l = count(lyr_sorted);
			l=_.omit(l, '', 'a', 'the');
			l=_.omit(l, function(value, key, object) {
				return _.isEqual(value, 1);
			});
			var chart=[{
				x:[],
				y:[],
				type:'bar'
			}];
			
			console.log(l);
			chart[0].x = Object.keys(l);
			chart[0].y =_.values(l);
			console.log(chart);

			res.render('default', {'title': artist + " | " + name, 'lyrics': lyrics, 'chart': chart});
		}).catch(function(err){
			console.log(err);
		})
	}).catch(function(err){
		console.log(err);
	})
});



var server = app.listen(3000, function(){
	console.log('Listening on port 3000');
});