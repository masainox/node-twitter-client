/**
 * @fileOverview Node.js module - Twitter Client Library
 * @name twitter-client.js
 * @author Masato INOUE <masainox@gmail.com>
 * @license MIT
 * twitter API http://apiwiki.twitter.com/w/page/22554679/Twitter-API-Documentation
 */

var querystring = require('querystring');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var HTTP = require('http');
var URL = require('url');

var apiVersion = '1';

var urls = {
    apiBase: 'http://api.twitter.com/' + apiVersion + '/',
    search: 'http://search.twitter.com/search.json',
    publicTimeline: 'http://api.twitter.com/1/statuses/public_timeline.json',
    userTimeline: 'http://api.twitter.com/1/statuses/user_timeline.json',
    homeTimeline: 'http://api.twitter.com/1/statuses/home_timeline.json',
    friendsTimeline: 'http://api.twitter.com/1/statuses/friends_timeline.json',
    showStatus: 'http://api.twitter.com/1/statuses/show.json',
    mentions: 'http://api.twitter.com/1/statuses/mentions.json',
    retweetedByMe: 'http://api.twitter.com/1/statuses/retweeted_by_me.json',
    retweetedToMe: 'http://api.twitter.com/1/statuses/retweeted_to_me.json',
    retweetsOfMe: 'http://api.twitter.com/1/statuses/retweets_of_me.json',
    directMessages: 'http://api.twitter.com/1/direct_messages.json',
    sentDirectMessages: 'http://api.twitter.com/1/direct_messages/sent.json',
    newDirectMessage: 'http://api.twitter.com/1/direct_messages/new.json',
    updateStatus: 'http://api.twitter.com/1/statuses/update.json',
    destroyStatus: 'http://api.twitter.com/1/statuses/destroy/',
    retweetStatus: 'http://api.twitter.com/1/statuses/retweet/',
    retweetsStatus: 'http://api.twitter.com/1/statuses/retweets/',
    lists: 'http://api.twitter.com/1/lists.json',
    listsMemberships: 'http://api.twitter.com/1/lists/memberships.json',
    friends: 'http://api.twitter.com/1/statuses/friends.json',
    friendsIds: 'http://api.twitter.com/1/friends/ids.json',
    followers: 'http://api.twitter.com/1/statuses/followers.json',
    followersIds: 'http://api.twitter.com/1/followers/ids.json',
    favorites: 'http://api.twitter.com/1/favorites.json',
    showUser: 'http://api.twitter.com/1/users/show.json',
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

    } else if (opts.method === 'DELETE') {
        this.oauth.delete(url, this.access.token,
                        this.access.tokenSecret, requestCallback);

    } else {
        throw new Error('http request method name error');
    }
}


/**
 * @method basicRequest
 * @param {String} url
 * @param {Object} opts method options
 * @param {Object} params optional parameters
 * @param {String} eventListener event listenner name
 */
Client.prototype.basicRequest = function(url, opts, params, eventListener) {
    var parsedUrl = URL.parse(url);
    var requestOptions = {
        host: parsedUrl.hostname,
        port: 80,
        method: opts.method,
        path: parsedUrl.pathname + (parsedUrl.search || '')
    };

    var self = this;
    var req = HTTP.request(requestOptions, function(res){
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            self.emit(eventListener, null, JSON.parse(body));
        });
    });

    req.on('error', function(err){
        self.emit(eventListener, err);
    });

    req.end();
};


// Streaming API


// Search API Methods

/**
 * @method search
 * @param {String} searchQuery
 * @param {Object} params optional parameters
 * see also http://dev.twitter.com/doc/get/search
 */
Client.prototype.search = function(searchQuery, params) {
    if (params){
        params['q'] = searchQuery;
    } else {
        params = {q: searchQuery};
    }

    var opts = {method:'GET'};
    var url = urls.search + '?' + querystring.stringify(params);
    this.basicRequest(url, opts, null, 'onSearch');
};


// Timeline Methods

/**
 * @method publicTimeline
 * @param {Object} params optional parameters
 * see also http://dev.twitter.com/doc/get/statuses/public_timeline
 */
Client.prototype.publicTimeline = function(params) {
    var opts = {method:'GET'};
    this.basicRequest(urls.publicTimeline, opts, params, 'onPublicTimeline');
};


/**
 * get user_timeline
 * @method userTimeline
 * @param {Object} params optional request parameters
 * see also http://dev.twitter.com/doc/get/statuses/user_timeline
 */
Client.prototype.userTimeline = function(params) {
    var opts = {method:'GET'};
    this.request(urls.userTimeline, opts, params, 'onUserTimeline');
}


/**
 * get home_timeline
 * @method homeTimeline
 * @param {Object} params optional request parameters
 * see also http://dev.twitter.com/doc/get/statuses/home_timeline
 */
Client.prototype.homeTimeline = function(params) {
    var opts = {method:'GET'};
    this.request(urls.homeTimeline, opts, params, 'onHomeTimeline');
}


/**
 * get friends_timeline
 * @method friendsTimeline
 * @param {Object} params optional request parameters
 * see also http://dev.twitter.com/doc/get/statuses/friends_timeline
 */
Client.prototype.friendsTimeline = function(params) {
    var opts = {method:'GET'};
    this.request(urls.friendsTimeline, opts, params, 'onFriendsTimeline');
}


/**
 * get mentions
 * @method mentions
 * @param {Object} params optional request parameters
 * see also http://dev.twitter.com/doc/get/statuses/mentions
 */
Client.prototype.mentions = function(params) {
    var opts = {method:'GET'};
    this.request(urls.mentions, opts, params, 'onMentions');
}


/**
 * @method retweetedByMe
 * @param {Object} params optional parameters
 * see also http://dev.twitter.com/doc/get/statuses/retweeted_by_me
 */
Client.prototype.retweetedByMe = function(params) {
    var opts = {method:'GET'};
    this.request(urls.retweetedByMe, opts, params, 'onRetweetedByMe');
};


/**
 * @method retweetedToMe
 * @param {Object} params optional parameters
 * see also http://dev.twitter.com/doc/get/statuses/retweeted_to_me
 */
Client.prototype.retweetedToMe = function(params) {
    var opts = {method:'GET'};
    this.request(urls.retweetedToMe, opts, params, 'onRetweetedToMe');
};


/**
 * @method retweetsOfMe
 * @param {Object} params optional parameters
 * see also http://dev.twitter.com/doc/get/statuses/retweets_of_me
 */
Client.prototype.retweetsOfMe = function(params) {
    var opts = {method:'GET'};
    this.request(urls.retweetsOfMe , opts, params, 'onRetweetsOfMe');
};


// Status Methods

/**
 * 指定したIDのつぶやき詳細を取得する
 * @method showStatus
 * @param {String} id status id
 */
Client.prototype.showStatus = function(id) {
    var opts = {method:'GET'};
    var params = {id: id};
    this.request(urls.showStatus, opts, params, 'onShowStatus');
}


/**
 * つぶやき送信
 * @method updateStatus
 * @param {String} nowStatus to post status
 */
Client.prototype.updateStatus = function(nowStatus) {
    var opts = {method:'POST'};
    var params = {status: nowStatus};
    this.request(urls.updateStatus, opts, params, 'onUpdateStatus');
}


/**
 * @method destroyStatus
 * @param {String} statusId
 * @param {Object} params optional parameters
 * see also http://dev.twitter.com/doc/post/statuses/destroy/:id
 */
Client.prototype.destroyStatus = function(statusId, params) {
    var opts = {method:'POST'};
    var url = urls.destroyStatus + statusId + '.json';
    this.request(url, opts, params, 'onDestroyStatus');
};


/**
 * @method retweetStatus
 * @param {String} statusId
 * @param {Object} params optional parameters
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-statuses-retweet
 */
Client.prototype.retweetStatus = function(statusId, params) {
    var opts = {method:'POST'};
    var url = urls.retweetStatus + statusId + '.json';
    this.request(url, opts, params, 'onRetweetStatus');
};


/**
 * @method retweetsStatus
 * @param {String} statusId
 * @param {Object} params optional parameters
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-statuses-retweets
 */
Client.prototype.retweetsStatus = function(statusId, params) {
    var opts = {method:'POST'};
    var url = urls.retweetsStatus + statusId + '.json';
    this.request(url, opts, params, 'onRetweetsStatus');
};


/**
 * @method retweetedById
 * @param {String} statusId
 * @param {Object} params optional parameters
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-GET-statuses-id-retweeted_by
 */
Client.prototype.retweetedById = function(statusId, params) {
    var opts = {method:'POST'};
    var url = urls.apiBase + 'statuses/' + statusId + '/retweeted_by.json';
    this.request(url, opts, params, 'onRetweetedById');
};


/**
 * @method retweetedByIds
 * @param {String} statusId
 * @param {Object} params optional parameters
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-GET-statuses-id-retweeted_by-ids
 */
Client.prototype.retweetedByIds = function(statusId, params) {
    var opts = {method:'POST'};
    var url = urls.apiBase + 'statuses/' + statusId + '/retweeted_by/ids.json';
    this.request(url, opts, params, 'onRetweetedByIds');
};


// User Methods

/**
 * @method showUser
 * @param {Object} params must have id or user_id or screen_name
 * {id: , user_id: , screen_name: }
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-users%C2%A0show
 */
Client.prototype.showUser = function(params) {
    var opts = {method:'GET'};
    this.request(urls.showUser, opts, params, 'onShowUser');
};


/**
 * TODO
 * @method lookupUser
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-users-lookup
 */


/**
 * TODO
 * @method searchUser
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-users-search
 */


/**
 * TODO
 * @method suggestionsUser
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-GET-users-suggestions
 */


/**
 * TODO
 * @method suggestionsCategoryUser
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-GET-users-suggestions-category
 */


/**
 * フォローしているユーザーを一覧で取得
 * @method friends
 * @param {Object} params optional request parameters
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-statuses%C2%A0friends
 */
Client.prototype.friends = function(params) {
    var opts = {method:'GET'};
    this.request(urls.friends, opts, params, 'onFriends');
}


/**
 * フォロワーを一覧で取得
 * @method followers
 * @param {Object} params optional request parameters
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-statuses%C2%A0followers
 */
Client.prototype.followers = function(params) {
    var opts = {method:'GET'};
    this.request(urls.followers, opts, params, 'onFollowers');
}


// List Methods

/**
 * Create a new list
 * @method createList
 * @param {String} userName
 * @param {Object} params {name: , mode: , description: }
 * see also http://apiwiki.twitter.com/w/page/22554731/Twitter-REST-API-Method:-POST-lists
 */
Client.prototype.createList = function(userName, params) {
    var opts = {method:'POST'};
    var url = urls.apiBase + userName + '/lists.json';
    this.request(url, opts, params, 'onCreateList');
};


/**
 * Updates the specified list
 * @method updateList
 * @param {String} userName
 * @param {Number} listId
 * @param {Object} params {name: , mode: , description: }
 * see also http://apiwiki.twitter.com/w/page/22554730/Twitter-REST-API-Method:-POST-lists-id
 */
Client.prototype.updateList = function(userName, listId, params) {
    var opts = {method:'POST'};
    var url = urls.apiBase + userName + '/lists/' + listId + '.json';
    this.request(url, opts, params, 'onUpdateList');
};


/**
 * リスト一覧を取得
 * @param {Object} params optional request parameters
 * {user: String, cursor: null}
 * see also http://apiwiki.twitter.com/w/page/22554720/Twitter-REST-API-Method:-GET-lists
 */
Client.prototype.lists = function(params) {
    var opts = {method:'GET'};
    this.request(urls.lists, opts, params, 'onLists');
}


/**
 * Show the specified list
 * @method showList
 * @param {String} userName user name
 * @param {String} listId the id or slug of the list
 * see also http://apiwiki.twitter.com/w/page/22554712/Twitter-REST-API-Method:-GET-list-id
 */
Client.prototype.showList = function(userName, listId) {
    var opts = {method:'GET'};
    var url = urls.apiBase + userName + '/lists/' + listId + '.json'
    this.request(url, opts, null, 'onShowList');
};


/**
 * @method destroyList
 * @param {String} userName user screen name
 * @param {String} listId id or slug of the list
 * see also http://apiwiki.twitter.com/w/page/22554696/Twitter-REST-API-Method:-DELETE-list-id
 */
Client.prototype.destroyList = function(userName, listId) {
    var opts = {method:'DELETE'};
    var url = urls.apiBase + userName + '/lists/' + listId + '.json'
    this.request(url, opts, null, 'onDestroyList');
};


/**
 * 指定したリストのタイムラインを取得
 * @method listTimeline
 * @param {String} userName リストオーナーのscreen_name
 * @param {String} listName 取得したいリストの名前
 * @param {Object} params HTTP request parameters
 * see also http://apiwiki.twitter.com/w/page/22554716/Twitter-REST-API-Method:-GET-list-statuses
 */
Client.prototype.listTimeline = function(userName, listName, params) {
    var opts = {method:'GET'};
    var url = urls.apiBase + userName + '/lists/' + listName + '/statuses.json';
    this.request(url, opts, params, 'onListTimeline');
}


/**
 * 指定したユーザーが登録されているリストの一覧を取得
 * @method listMemberships
 * @param {String} userName
 * @param {Object} params optional request parameters
 * see also http://apiwiki.twitter.com/w/page/22554715/Twitter-REST-API-Method:-GET-list-memberships
 */
Client.prototype.listsMemberships = function(userName, params) {
    var opts = {method:'GET'};
    var url = urls.apiBase + userName + '/lists/memberships.json';
    this.request(url, opts, params, 'onListsMemberships');
}


/**
 * List the lists the specified user follows
 * @method listSubscriptions
 * @param {String} userName user screen name
 * @param {Object} params optional parameters
 * see also http://apiwiki.twitter.com/w/page/22554719/Twitter-REST-API-Method:-GET-list-subscriptions
 */
Client.prototype.listSubscriptions = function(userName, params) {
    var opts = {method:'GET'};
    var url = urls.apiBase + userName + '/lists/subscriptions.json';
    this.request(url, opts, params, 'onListSubscriptions');
};


// List Members Methods


// List Subscribers Methods


// Direcet Message Methods

/**
 * DM取得
 * @param {Object} params optional request parameters
 * {since_id:null, max_id:null, count:null, page:null}
 * see also http://apiwiki.twitter.com/w/page/22554699/Twitter-REST-API-Method:-direct_messages
 */
Client.prototype.directMessages = function(params) {
    var opts = {method:'GET'};
    this.request(urls.directMessages, opts, params, 'onDirectMessages');
}


/**
 * 自分が送信したDMを取得する
 * @param {Object} params optional request parameters
 * see also http://apiwiki.twitter.com/w/page/22554702/Twitter-REST-API-Method:-direct_messages%C2%A0sent
 */
Client.prototype.sentDirectMessages = function(params) {
    var opts = {method:'GET'};
    this.request(urls.sentDirectMessages, opts, params, 'onSentDirectMessages');
}


/**
 * DM送信
 * @param {String} to user screen name
 * @param {String} message to send direct message
 * see also http://apiwiki.twitter.com/w/page/22554701/Twitter-REST-API-Method:-direct_messages%C2%A0new
 */
Client.prototype.newDirectMessage = function(to, message) {
    var opts = {method:'POST'};
    var params = {screen_name: to, text: message};
    this.request(urls.newDirectMessage, opts, params, 'onNewDirectMessage');
}


/**
 * @method destroyDirectMessage
 * @param {String} dmId The ID of the direct message to destroy
 * see also http://apiwiki.twitter.com/w/page/22554700/Twitter-REST-API-Method:-direct_messages%C2%A0destroy
 */
Client.prototype.destroyDirectMessage = function(dmId) {
    var opts = {method:'DELETE'};
    var url = urls.apiBase + 'direct_messages/destroy/' + dmId + '.json';
    this.request(url, opts, null, 'onDestroyDirectMessage');
};


// Friendship Methods


// Social Graph Methods

/**
 * フォローしているユーザーのIDをのみ取得する
 *
 * 引数によって動作が異なる
 * id指定があった場合は指定したユーザーのフレンドを取得
 * id指定がない場合はaccessTokenの持ち主のフレンドを取得
 *
 * @param {Object} params
 * {id: , user_id: , screen_name: , cursor: }
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-friends%C2%A0ids
 */
Client.prototype.friendsIds = function(params) {
    var opts = {method:'GET'};
    this.request(urls.friendsIds, opts, params, 'onFriendsIds');
};


/**
 *
 * 引数の値によって動作が異なる
 * id指定があった場合は指定したユーザーのフォロワーを取得
 * id指定がない場合はaccessTokenの持ち主のフォロワーを取得
 *
 * フォロワーのIDのみを取得する
 * {11111, 22222} 形式
 *
 * @param {Object} params request parameters
 * {id: , user_id: , screen_name: ,cursor: }
 * see also http://apiwiki.twitter.com/Twitter-REST-API-Method%3A-followers%C2%A0ids
 */
Client.prototype.followersIds = function(params) {
    var opts = {method:'GET'};
    this.request(urls.followersIds, opts, params, 'onFollowersIds');
};


// Account Methods


// Favorites Methods

/**
 * get favorites
 * @param {Object} params request parameters
 */
Client.prototype.favorites = function(params) {
    var opts = {method:'GET'};
    this.request(urls.favorites, opts, params, 'onFavorites');
}


// Notification Methods

// Block Methods

// Spam Reporting Methods

// Saved Searches Methods

// OAuth Methods

// Trends Methods

// Geo methods

// Help Methods

exports.Client = Client;
