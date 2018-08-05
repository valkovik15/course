module.exports = {

    'facebookAuth' : {
        'clientID'      : '210456179651489', // your App ID
        'clientSecret'  : '56622c5488bd30885c0af159407b4b9c', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        profileFields:['id', 'emails', 'link', 'locale', 'name',
  'timezone', 'updated_time', 'verified', 'displayName','photos']
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    }
  }
