/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Smashrun authentication strategy authenticates requests by delegating to
 * Smashrun using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts a `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`     identifies client to Smashrun
 *   - `clientSecret`  secret used to establish ownership of the client key
 *   - `callbackURL`     URL to which Smashrun will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new SmashrunStrategy({
 *         clientID: 'user_123456789',
 *         clientSecret: 'super_s33kret'
 *         callbackURL: 'https://www.example.net/auth/smashrun/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://secure.smashrun.com/oauth2/authenticate';
  options.tokenURL = options.tokenURL || 'https://secure.smashrun.com/oauth2/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'smashrun';

  // Twitch has some non-standard requirements that we need to adjust
  this._oauth2.setAuthMethod('OAuth');
  this._oauth2.useAuthorizationHeaderforGET(true);
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Smashrun.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `id`
 *   - `username`
 *   - `displayName`
 *
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Object} params
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get('https://api.smashrun.com/v1/my/userinfo', accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('Failed to fetch user profile', err)); }
    
    try {
      var json = JSON.parse(body);
      
      var profile = { provider: 'smashrun' };
      profile.id = json.id;
      profile.username = json.userName;
      profile.displayName = json.firstName + " " + json.lastName;
      
      profile._raw = body;
      profile._json = json;
      
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;

