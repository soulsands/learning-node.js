/**
 * Module dependencies.
 */
//var http = require('http')
//  , req = http.IncomingMessage.prototype;

var req = (exports = module.exports = {});

/**
 * Initiate a login session for `user`.
 *
 * Options:
 *   - `session`  Save login state in session, defaults to _true_
 *
 * Examples:
 *
 *     req.logIn(user, { session: false });
 *
 *     req.logIn(user, function(err) {
 *       if (err) { throw err; }
 *       // session saved
 *     });
 *
 * @param {User} user //依赖把用户用户出去
 * @param {Object} options
 * @param {Function} done
 * @api public
 */
//所以这里改了req原型上一点东西
req.login = req.logIn = function(user, options, done) {
  //如果第二个是函数，则没有options,
  //我在typescript项目中看到这个方法了
  if (typeof options == "function") {
    done = options;
    options = {};
  }
  options = options || {};

  var property = "user";
  //如果已经激活，则获取属性，如果没激活，后面则把 user 放到user上
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || "user";
  }

  //session默认是true，如果是false则需要写出来
  var session = options.session === undefined ? true : options.session;
  //把用户名字放到req上了？后面看代码确实如此
  this[property] = user;
  if (session) {
    //如果有session，则还要去用session manager 去用session的login方法，如果选项为session：false，则直接跳过
    if (!this._passport) {
      throw new Error("passport.initialize() middleware not in use");
    }
    if (typeof done != "function") {
      throw new Error("req#login requires a callback function");
    }

    var self = this;
    //session manager 也有loginin方法
    //在初始胡按但时候添加上了——sm
    this._passport.instance._sm.logIn(this, user, function(err) {
      if (err) {
        self[property] = null;
        return done(err);
      }
      done();
    });
  } else {
    done && done();
  }
};

/**
 * Terminate an existing login session.
 *
 * @api public
 */
req.logout = req.logOut = function() {
  var property = "user";
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || "user";
  }

  this[property] = null;
  if (this._passport) {
    this._passport.instance._sm.logOut(this);
  }
};

/**
 * Test if request is authenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isAuthenticated = function() {
  var property = "user";
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || "user";
  }

  return this[property] ? true : false;
};

/**
 * Test if request is unauthenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isUnauthenticated = function() {
  return !this.isAuthenticated();
};
