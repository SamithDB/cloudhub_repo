// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '633621342907-g5a3e121npdtb8ms06mvsmc6ivcrlhbl.apps.googleusercontent.com', // your App ID
        'clientSecret'  : '5WKDqRMIFmI_RAcJP_sBca1H', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : '633621342907-g5a3e121npdtb8ms06mvsmc6ivcrlhbl.apps.googleusercontent.com',
        'consumerSecret'    : '5WKDqRMIFmI_RAcJP_sBca1H',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '633621342907-g5a3e121npdtb8ms06mvsmc6ivcrlhbl.apps.googleusercontent.com',
        'clientSecret'  : '5WKDqRMIFmI_RAcJP_sBca1H',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};