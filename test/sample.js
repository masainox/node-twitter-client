
var client = require('../lib/twitter-client');
var OAuth = require('oauth').OAuth;

var consumerKey = 'YOUR_CONSUMER_KEY';
var consumerSecret = 'YOUR_CONSUMER_SECRET';
var accessToken = 'YOUR_ACCESS_TOKEN';
var accessTokenSecret = 'YOUR_ACCESS_TOKEN_SECRET';

var oauth = new OAuth('http://twitter.com/oauth/request_token',
                               'http://twitter.com/oauth/access_token',
                                consumerKey, consumerSecret,
                                '1.0', null, 'HMAC-SHA1');

var access = {token: accessToken, tokenSecret: accessTokenSecret};
tw = new client.Client(oauth, access);

tw.on('onUserTimeline', function(err, data) {
    if (err) {
        console.log('error');
    } else {
        console.log(data);
    }
});

tw.userTimeline();
