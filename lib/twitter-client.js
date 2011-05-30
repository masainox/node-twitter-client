/**
 * @fileOverview Node.js module - Twitter Client Library
 * @name twitter-client.js
 * @author Masato INOUE <masainox@gmail.com>
 * @license MIT
 */

var querystring = require('querystring');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var urls = {
    apiBase: 'http://api.twitter.com/',
    userTimeline: 'http://api.twitter.com/1/statuses/user_timeline.json',
    mentions: 'http://api.twitter.com/1/statuses/mentions.json',
    directMessages: 'http://api.twitter.com/1/direct_messages.json',
    sentDirectMessages: 'http://api.twitter.com/1/direct_messages/sent.json',
    newDirectMessage: 'http://api.twitter.com/1/direct_messages/new.json',
    updateStatus: 'http://api.twitter.com/1/statuses/update.json',
    lists: 'http://api.twitter.com/1/lists.json',
    listsMemberships: 'http://api.twitter.com/1/lists/memberships.json',
    friends: 'http://api.twitter.com/1/statuses/friends.json',
    followers: 'http://api.twitter.com/1/statuses/followers.json',
};

exports.urls = urls;


/**
 * Client Class
 * @param {Object} oauth OAuth object
 * @param {Object} access OAuth access token object
 * {token:String, token_secret:String}
 */
var Client = function(oauth, access) {
    this.oauth = oauth;
    this.access = access;
}

util.inherits(Client, EventEmitter);


/**
 * APIリクエストを処理します。
 * @param {String} url request URL
 * @param {Object} opts method options
 * @param {Object} params request parameters
 * @param {String} eventListener event listener name
 */
Client.prototype.request = function(url, opts, params, eventListener) {

    var self = this;
    var requestCallback = function(err, data) {

        if (err) {
            //console.log('requestCallback() error');
            self.emit(eventListener, err);
        } else {
            //console.log('requestCallback() ok');
            self.emit(eventListener, null, JSON.parse(data));
        }
    };


    if (opts.method === 'GET') {
        if (params) {
            url = url + '?' + querystring.stringify(params);
        }

        this.oauth.get(url, this.access.token,
                       this.access.tokenSecret, requestCallback);


    } else if (opts.method === 'POST') {
        this.oauth.post(url, this.access.token,
                        this.access.tokenSecret, params, requestCallback);

    } else {
        throw new Error('http request method name error');
    }
}


/**
 * timeline取得
 * @param {Object} params request parameters
 */
Client.prototype.userTimeline = function(params) {
    var opts = {method:'GET'};
    this.request(urls.userTimeline, opts, params, 'onUserTimeline');
}


/**
 * mention取得
 * @param {Object} params request parameters
 */
Client.prototype.mentions = function(params) {
    var opts = {method:'GET'};
    this.request(urls.mentions, opts, params, 'onMentions');
}


/**
 * DM取得
 * @param {Object} params HTTP request parameters
 * {since_id:null, max_id:null, count:null, page:null}
 */
Client.prototype.directMessages = function(params) {
    var opts = {method:'GET'};
    this.request(urls.directMessages, opts, params, 'onDirectMessages');
}


/**
 * 自分が送信したDMを取得する
 * @param {Object} params HTTP request parameters
 */
Client.prototype.sentDirectMessages = function(params) {
    var opts = {method:'GET'};
    this.request(urls.sentDirectMessages, opts, params, 'onSentDirectMessages');
}


/**
 * DM送信
 * @param {String} to user screen name
 * @param {String} message to send direct message
 */
Client.prototype.newDirectMessage = function(to, message) {
    var opts = {method:'POST'};
    var params = {screen_name: to, text: message};
    this.request(urls.newDirectMessage, opts, params, 'onNewDirectMessage');
}


/**
 * つぶやき送信
 * @param {String} now_status to post status
 */
Client.prototype.updateStatus = function(nowStatus) {
    var opts = {method:'POST'};
    var params = {status: nowStatus};
    this.request(urls.updateStatus, opts, params, 'onUpdateStatus');
}


/**
 * リスト一覧を取得
 * @param {Object} params HTTP request parameters
 * {user: String, cursor: null}
 */
Client.prototype.lists = function(params) {
    var opts = {method:'GET'};
    this.request(urls.lists, opts, params, 'onLists');
}


/**
 * 指定したユーザーが登録されているリストの一覧を取得
 * @param {String} userName ユーザーのscreen_name
 * @param {Object} params HTTP request parameters
 */
Client.prototype.listsMemberships = function(userName, params) {
    var opts = {method:'GET'};
    var url = urls.apiBase + '1/' + userName + '/lists/memberships.json';
    this.request(url, opts, params, 'onListsMemberships');
}


/**
 * 指定したリストのタイムラインを取得
 * @param {String} userName リストオーナーのscreen_name
 * @param {String} listName 取得したいリストの名前
 * @param {Object} params HTTP request parameters
 */
Client.prototype.listTimeline = function(userName, listName, params) {
    var opts = {method:'GET'};
    var url = urls.apiBase + '1/' + userName + '/lists/' + listName + '/statuses.json';
    this.request(url, opts, params, 'onListTimeline');
}


/**
 * フォローしているユーザーを一覧で取得
 * @param {Object} params HTTP request parameters
 */
Client.prototype.friends = function(params) {
    var opts = {method:'GET'};
    this.request(urls.friends, opts, params, 'onFriends');
}


/**
 * フォロワーを一覧で取得
 * @param {Object} params HTTP request parameters
 */
Client.prototype.followers = function(params) {
    var opts = {method:'GET'};
    this.request(urls.followers, opts, params, 'onFollowers');
}


exports.Client = Client;
