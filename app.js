const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const config = require('./config.js');
const moment = require('moment');

const Twit = require('twit');
const T = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests. 
});

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

function getTwitterData(callback){
    var twitData = {};
    T.get('account/verify_credentials', function(err, data, response ){
        console.log('Got user info!');
        twitData.user = data;
        T.get('statuses/home_timeline', {
            count: 5
        }, function (err, data, response) {
            console.log('Got recent timeline tweets!');
            twitData.tweets = data;
            for(let i = 0; i < twitData.tweets.length; ++i) {
                let t = moment(twitData.tweets[i].created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY');
                twitData.tweets[i].created_at = t.fromNow();
            }

            T.get('friends/list', {
                count: 5
            }, function (err, data, response) {
                console.log('Got recent friends!');
                twitData.friends = data.users;
                T.get('direct_messages', {
                    count: 5
                }, function (err, data, response) {
                    console.log('Got recent DMs!');
                    twitData.dms = data;
                    for(let i = 0; i < twitData.dms.length; ++i) {
                        let t = moment(twitData.dms[i].created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY');
                        twitData.dms[i].created_at = t.fromNow();
                        console.log(t.fromNow());
                    }
                    //console.dir(data)
                    callback(twitData);
                });    
            });
        });
    });
}

app.get('/', function(req, res){
    getTwitterData(function(data){
        res.render('index', data)
    });
})

app.listen(3000, function(){
    console.log('App listening on :3000');
})