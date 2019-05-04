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
/**
 * main logic function recursive if the do what it says is called
 * @param {*} cmd command to run
 * @param {*} args argument to run command with
 */
function runCommands(cmd, args) {
    switch (cmd) {
        case ("concert-this"):
            const queryUrl = "https://rest.bandsintown.com/artists/" + args + "/events?app_id=codingbootcamp";
            axios.get(queryUrl)
                .then(function (response) {
                    let concertData = response.data;
                    if (!concertData.length) {
                        console.log("No concert data given yet for " + args);
                        return;
                    }

                    let data = [];
                    data.push("Upcoming concerts for " + args + ":");
                    for (let i in concertData) {
                        let concert = concertData[i];
                        data.push(concert.venue.city + "," +
                            (concert.venue.region || concert.venue.country) +
                            " at " + concert.venue.name + " " +
                            moment(concert.datetime).format("MM/DD/YYYY")
                        );
                    }
                    console.log(data);
                })
                //handle error
                .catch(function (error) {
                    console.log(error);
                });
            break;

        case ("spotify-this-song"):
            //handle no input
            if (args == "") args = "The Sign";
            spotify.search({ type: 'track', query: args }, function (err, data) {
                //error handling
                if (err) {
                    return console.log('Error : ' + err);
                }
                let songs = data.tracks.items;
                let data = [];
                for (let i in songs) {
                    data.push({
                        "artist(s) ": songs[i].artists.map(function(artist){
                                                           return artist.name;
                                                           }),
                        "song name ": songs[i].name,
                        "preview song ": songs[i].preview_url,
                        "album ": songs[i].album.name,
                    });
                }
                //if i populated the array
                if (data.length) {
                    console.log(data);
                }
                else {
                    console.log('Error. No result found for ' + args);
                }
            });
            break;

        //movie look up
        case ("movie-this"):
            // handle no input
            if (args == "") args = "Mr.Nobody";
            //create query url
            const queryUrl = "http://www.omdbapi.com/?t=" + args + "&y=&plot=short&apikey=trilogy";
            //use axios to perform get
            axios.get(queryUrl).then(function (response) {
                    let movieData = response.data;

                    let data = [
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
                //handle error
            ).catch(function (error) {
                console.log('Error. No result found for ' + args);
            });
            break;
        //read in inputs from file
        case ("do-what-it-says"):
        //read from the file
            fs.readFile("random.txt", "utf8", function (error, data) {
                if (error) {
                    return console.log(error);
                }
                //TODO: should account for multiple commands
                let dataArr = data.split(",");
                if (dataArr.length == 2) {
                    runCommands(dataArr[0], dataArr[1]);
                } else if (dataArr.length == 1) {
                    runCommands.run(dataArr[0]);
                }
            });
            break;
    }
}