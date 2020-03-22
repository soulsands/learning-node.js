/**
 * Module dependencies.
 */

var pause = require("pause"), //暂停流处理的库，暂停后可以结束或者继续处理
  util = require("util"), //node默认的工具，下面使用了继承放啊
  Strategy = require("passport-strategy"); //没啥意义，必须要覆盖的一个东西，覆盖之后才能调用

/**
 * `SessionStrategy` constructor.
 *deserializeUser 是一个方法需要自定义一个，结果是返回一个获取到的用户
 * @api public
 */
function SessionStrategy(options, deserializeUser) {
  if (typeof options == "function") {
    //兼容处理
    deserializeUser = options;
    options = undefined;
  }
  options = options || {};

  Strategy.call(this); //自定义策略，this已经session strategy了
  this.name = "session"; //给自己添加的名字
  this._deserializeUser = deserializeUser; //一个函数
}

/**
 * Inherit from `Strategy`.
 */
util.inherits(SessionStrategy, Strategy); //继承了，会覆盖方法

/**
 * Authenticate request based on the current session state.
 *
 * The session authentication strategy uses the session to restore any login
 * state across requests.  If a login session has been established, `req.user`
 * will be populated with the current user.
 *
 * This strategy is registered automatically by Passport.
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
SessionStrategy.prototype.authenticate = function(req, options) {
  //req会被绑定，如果并且再次之前肯定会调用initilize
  //inilitilze会添加属性，从这里来看会添加—passport属性

  if (!req._passport) {
    return this.error(new Error("passport.initialize() middleware not in use"));
  }
  options = options || {};

  var self = this,
    su;
  if (req._passport.session) {
    su = req._passport.session.user;
  }

  if (su || su === 0) {
    // NOTE: Stream pausing is desirable in the case where later middleware is
    //       listening for events emitted from request.  For discussion on the
    //       matter, refer to: https://github.com/jaredhanson/passport/pull/106

    var paused = options.pauseStream ? pause(req) : null;
    this._deserializeUser(su, req, function(err, user) {
      if (err) {
        return self.error(err);
      }
      if (!user) {
        delete req._passport.session.user;
      } else {
        // TODO: Remove instance access
        var property = req._passport.instance._userProperty || "user";
        req[property] = user;
      }
      self.pass();
      if (paused) {
        paused.resume();
      }
    });
  } else {
    self.pass();
  }
};

/**
 * Expose `SessionStrategy`.
 */
module.exports = SessionStrategy;
