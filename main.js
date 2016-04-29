var express = require('express');
var http  = require('http');
var app = express();
var scraperjs = require('scraperjs');
var _ = require('underscore');
var lastfm = require('lastfmapi');
var Promise = require('promise');

lfm = new lastfm({
	'api_key' : '0989b876a250ebf487e96365832bde72',
	'secret' : 'c9522b40836f9a231cd6dbb4f8e0f9ca'
});

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

function getTracks(artistName){
	return new Promise(function(resolve, reject){
	lfm.artist.getTopTracks(
		{'artist': artistName},
			function(err, topTracks){
				if(err){reject(err);}
				else{
				console.log("TESTING PRINT STATEMENTS");
				console.log("********")
				var songName = (topTracks.track[0].name);
				var trackList = [];
				for(i = 0; i < 10; i++){
					trackList[i] = topTracks.track[i].name;
				}
				resolve(trackList);
				}
			})
		});
}

function getLyrics(artistName, songName){
	return new Promise(function(res, rej){
		music.matcherLyrics({q_track:songName,q_artist:artistName})
			.then(function(data){
			res(data.message.body.lyrics.lyrics_body);
			}).catch(function(err){
			rej(err);
})
	});
}

app.get('/:artist?', function(req, res){
	var i = 0;
	console.log("ARTIST TOP 10");
	var artistName = req.params.artist;
	var tracksPromise = getTracks(artistName);
	// var lyricsPromise = getLyrics("Kanye", "Power");
	// lyricsPromise.then(function(response){
	// 	console.log(response);
	// })
	tracksPromise.then(function(response){
		response.forEach(function(listItem, index){
			if(index < 10){
				// console.log(listItem);
				var lyricsPromise = getLyrics(artistName, listItem);
				lyricsPromise.then(function(response){
					console.log("SONG NAME: " + listItem);
					console.log ("=======")
					console.log(response);
					console.log("========");
				})
			}
		})
	});
});

// app.get('/:artist?', function(req, res){
// 	console.log("ARTIST TOP 10");
// 	var Artist = req.params.artist;
// 	var Top_tracks = [];
// 	var NUM_TRACK = 10;
// 	lfm.artist.getTopTracks(
// 		{'artist':Artist},
// 		function(err, topTracks){
// 			if (err) {
// 				//console.log(err);
// 				res.render('artist', {'title': 'Cannot Find', 'topTracks': '' });
// 				return;
// 				//throw err;
// 			}
// 			var tracks = topTracks.track;
// 			//console.log(tracks);
// 			for(var i=0; i<NUM_TRACK; i++){
// 				Top_tracks[i] = tracks[i].name;
// 			}
// 			// console.log(Top_tracks);
// 			var track_l;
// 			var trackID;
// 			var combined_lyrics=[];
// 			var t = 1;
// 			var i;
// 			for(i = 0; i<NUM_TRACK; i++){
// 				console.log("INDEX: " + i);
// 				music.trackSearch({q:Top_tracks[i], q_artist:Artist}).then(function(data){
// 					track_l = data.message.body.track_list;
// 					trackID = track_l[0].track.track_id;
// 					music.trackLyrics({track_id: trackID}).then(function(data){
// 						combined_lyrics[t]=JSON.stringify(data.message.body.lyrics.lyrics_body);
// 						// console.log(t + "COMBINED LYRICS" + combined_lyrics[t]);
// 						t++;
// 					}).catch(function(err){
// 						console.log(err);
// 					});
// 				}).catch(function(err){
// 					console.log(err);
// 				});
// 				// console.log("Test: " + combined_lyrics);
// 			}

// 			res.render('artist', {'title': Artist, 'topTracks': Top_tracks });
// 			return;
// 		}
// 		);
// });



app.get('/:artist?/:name?', function(req, res){
	var name = req.params.name;
	var artist = req.params.artist;
	music.trackSearch({q:name, q_artist:artist}).then(function(data){
		console.log(data.message.body.track_list);
		var track_l = data.message.body.track_list;
		trackID = track_l[0].track.track_id;
		artist = track_l[0].track.artist_name;
		name = track_l[0].track.track_name;

		music.trackLyrics({track_id: trackID}).then(function(data){
			//console.log(data.message.body.lyrics.lyrics_body);
			var lyrics = data.message.body.lyrics.lyrics_body;
			//lyrics = lyrics.replace("\n", "<br />");
			//console.log(lyrics);
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
			chart[0].x = Object.keys(l);
			chart[0].y =_.values(l);
			res.render('default', {'title': artist + " | " + name, 'lyrics': lyrics, 'chart': chart});
		}).catch(function(err){
			console.log(err);
		})
	}).catch(function(err){
		console.log(err);
	})
});



var server = app.listen(process.env.PORT || 3000, function(){
	console.log('Listening on port 3000');
});
