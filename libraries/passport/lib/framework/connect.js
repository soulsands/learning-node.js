/**
 * Module dependencies.
 */
var initialize = require("../middleware/initialize"),
  authenticate = require("../middleware/authenticate");

/**
 * Framework support for Connect/Express.
 *
 * This module provides support for using Passport with Express.  It exposes
 * middleware that conform to the `fn(req, res, next)` signature and extends
 * Node's built-in HTTP request object with useful authentication-related
 * functions.
 *
 * @return {Object}
 * @api protected
 */
exports = module.exports = function() {
  // HTTP extensions.
  //添加一些方法原型上的方法，这些方法后面会用得上
  exports.__monkeypatchNode();

  return {
    initialize: initialize,
    authenticate: authenticate
  };
};

exports.__monkeypatchNode = function() {
  var http = require("http");
  var IncomingMessageExt = require("../http/request");
  //http://nodejs.cn/api/http.html#http_class_http_incomingmessage
  //在http上面的一个类的原型上添加了一些方法，后续要观察是否用到了@todo
  http.IncomingMessage.prototype.login = http.IncomingMessage.prototype.logIn =
    IncomingMessageExt.logIn;
  http.IncomingMessage.prototype.logout = http.IncomingMessage.prototype.logOut =
    IncomingMessageExt.logOut;
  http.IncomingMessage.prototype.isAuthenticated =
    IncomingMessageExt.isAuthenticated;
  http.IncomingMessage.prototype.isUnauthenticated =
    IncomingMessageExt.isUnauthenticated;
};
