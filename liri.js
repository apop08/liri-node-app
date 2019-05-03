require("dotenv").config();
var fs = require("fs");
var keys = require("./keys.js");
const axios = require('axios');
var Spotify = require('node-spotify-api');
var moment = require('moment');
var spotify = new Spotify(keys.spotify);

const inputType = process.argv[2];
const args = (process.argv).splice(3).join(" ");
runCommands(inputType, args)
function runCommands(cmd, args) {
    switch (cmd) {
        case ("concert-this"):
            var queryUrl = "https://rest.bandsintown.com/artists/" + args + "/events?app_id=codingbootcamp";
            axios.get(queryUrl)
                .then(function (response) {
                    var concertData = response.data;
                    if (!concertData.length) {
                        console.log("No concert data given yet for " + args);
                        return;
                    }

                    var data = [];
                    data.push("Upcoming concerts for " + args + ":");
                    for (var i in concertData) {
                        var concert = concertData[i];
                        data.push(
                            concert.venue.city + "," +
                            (concert.venue.region || concert.venue.country) +
                            " at " + concert.venue.name + " " +
                            moment(concert.datetime).format("MM/DD/YYYY")
                        );
                    }
                    console.log(data);
                })
                .catch(function (error) {
                    console.log(error);
                });
            break;

        case ("spotify-this-song"):
            if (args == "") {
                args = "The Sign";
            }
            spotify.search({ type: 'track', query: args }, function (err, data) {
                if (err) {
                    return console.log('Error : ' + err);
                }
                function getArtist(artist) {
                    return artist.name
                }
                var songs = data.tracks.items;
                var data = [];
                for (var i in songs) {
                    data.push({
                        "artist(s) ": songs[i].artists.map(getArtist),
                        "song name ": songs[i].name,
                        "preview song ": songs[i].preview_url,
                        "album ": songs[i].album.name,
                    });
                }
                if (data.length) {
                    console.log(data);
                } else {
                    console.log('Error. No result found for ' + args);
                }
            });
            break;


        case ("movie-this"):
            if (args == "") {
                args = "Mr.Nobody";
            }
            var queryUrl = "http://www.omdbapi.com/?t=" + args + "&y=&plot=short&apikey=trilogy";
            axios.get(queryUrl).then(
                function (response) {
                    var movieData = response.data;

                    var data = [
                        "Title " + movieData.Title,
                        "Year " + movieData.Year,
                        "Rated " + movieData.Rated,
                        "IMDB Rating " + movieData.imdbRating,
                        "Rotten Tomatoes Rating " + movieData.Ratings[1].Value,
                        "Country " + movieData.Country,
                        "Language " + movieData.Language,
                        "Plot " + movieData.Plot,
                        "Actors " + movieData.Actors
                    ].join("\n\n");
                    console.log(data);
                }
            ).catch(function (error) {
                console.log('Error. No result found for ' + args);
            });
            break;

        case ("do-what-it-says"):
            fs.readFile("random.txt", "utf8", function (error, data) {
                if (error) {
                    return console.log(error);
                }

                var dataArr = data.split(",");
                if (dataArr.length == 2) {
                    runCommands(dataArr[0], dataArr[1]);
                } else if (dataArr.length == 1) {
                    runCommands.run(dataArr[0]);
                }
            });
            break;
    }
}