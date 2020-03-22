/**
 * Module dependencies.
 */
var SessionStrategy = require("./strategies/session"),
  SessionManager = require("./sessionmanager");

/**
 * `Authenticator` constructor.
 *
 * @api public
 */
function Authenticator() {
  this._key = "passport";
  this._strategies = {}; //策略
  this._serializers = []; //一些函数
  this._deserializers = [];
  this._infoTransformers = [];
  this._framework = null; //这个可以
  this._userProperty = "user";

  this.init();
}

/**
 * Initialize authenticator.
 *
 * @api protected
 */
Authenticator.prototype.init = function() {
  //默认是调用了这方法，让组件默认支持connect和express这种
  //当然也可以改成别的
  //这里获取之后还调用了一下，
  this.framework(require("./framework/connect")());

  this.use(new SessionStrategy(this.deserializeUser.bind(this)));

  this._sm = new SessionManager(
    { key: this._key },
    this.serializeUser.bind(this)
  );
};

/**
 * Utilize the given `strategy` with optional `name`, overridding the strategy's
 * default name.
 *
 * Examples:
 *
 *     passport.use(new TwitterStrategy(...));
 *
 *     passport.use('api', new http.BasicStrategy(...));
 *
 * @param {String|Strategy} name
 * @param {Strategy} strategy
 * @return {Authenticator} for chaining
 * @api public
 */
Authenticator.prototype.use = function(name, strategy) {
  if (!strategy) {
    strategy = name;
    name = strategy.name;
  }
  if (!name) {
    throw new Error("Authentication strategies must have a name");
  }

  //这里把session的名字绑定上了
  this._strategies[name] = strategy;
  return this;
};

/**
 * Un-utilize the `strategy` with given `name`.
 *
 * In typical applications, the necessary authentication strategies are static,
 * configured once and always available.  As such, there is often no need to
 * invoke this function.
 *
 * However, in certain situations, applications may need dynamically configure
 * and de-configure authentication strategies.  The `use()`/`unuse()`
 * combination satisfies these scenarios.
 *
 * Examples:
 *
 *     passport.unuse('legacy-api');
 *
 * @param {String} name
 * @return {Authenticator} for chaining
 * @api public
 */
Authenticator.prototype.unuse = function(name) {
  delete this._strategies[name];
  return this;
};

/**
 * Setup Passport to be used under framework.
 *
 * By default, Passport exposes middleware that operate using Connect-style
 * middleware using a `fn(req, res, next)` signature.  Other popular frameworks
 * have different expectations, and this function allows Passport to be adapted
 * to operate within such environments.
 *
 * If you are using a Connect-compatible framework, including Express, there is
 * no need to invoke this function.
 *
 * Examples:
 *
 *     passport.framework(require('hapi-passport')());
 *
 * @param {Object} name
 * @return {Authenticator} for chaining
 * @api public
 */
Authenticator.prototype.framework = function(fw) {
  this._framework = fw;
  return this;
};

/**
 * Passport's primary initialization middleware.
 *
 * This middleware must be in use by the Connect/Express application for
 * Passport to operate.
 *
 * Options:
 *   - `userProperty`  Property to set on `req` upon login, defaults to _user_
 *
 * Examples:
 *
 *     app.use(passport.initialize());
 *
 *     app.use(passport.initialize({ userProperty: 'currentUser' }));
 *
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
Authenticator.prototype.initialize = function(options) {
  options = options || {};
  this._userProperty = options.userProperty || "user";
  //哦哀悼
  //require('./framework/connect')
  return this._framework.initialize(this, options);
};

/**
 * Middleware that will authenticate a request using the given `strategy` name,
 * with optional `options` and `callback`.
 *
 * Examples:
 *
 *     passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })(req, res);
 *
 *     passport.authenticate('local', function(err, user) {
 *       if (!user) { return res.redirect('/login'); }
 *       res.end('Authenticated!');
 *     })(req, res);
 *
 *     passport.authenticate('basic', { session: false })(req, res);
 *
 *     app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
 *       // request will be redirected to Twitter
 *     });
 *     app.get('/auth/twitter/callback', passport.authenticate('twitter'), function(req, res) {
 *       res.json(req.user);
 *     });
 *
 * @param {String} strategy
 * @param {Object} options
 * @param {Function} callback
 * @return {Function} middleware
 * @api public
 */
Authenticator.prototype.authenticate = function(strategy, options, callback) {
  //返回一个中间件，
  //如果按内置的例子，那么stagety是session
  return this._framework.authenticate(this, strategy, options, callback);
};

/**
 * Middleware that will authorize a third-party account using the given
 * `strategy` name, with optional `options`.
 *
 * If authorization is successful, the result provided by the strategy's verify
 * callback will be assigned to `req.account`.  The existing login session and
 * `req.user` will be unaffected.
 *
 * This function is particularly useful when connecting third-party accounts
 * to the local account of a user that is currently authenticated.
 *
 * Examples:
 *
 *    passport.authorize('twitter-authz', { failureRedirect: '/account' });
 *
 * @param {String} strategy
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
Authenticator.prototype.authorize = function(strategy, options, callback) {
  options = options || {};
  options.assignProperty = "account";

  var fn = this._framework.authorize || this._framework.authenticate;
  return fn(this, strategy, options, callback);
};

/**
 * 在session里面恢复数据的东西，就是说根据id，请求数据库，绑定到req里面
 * Middleware that will restore login state from a session.
 *
 * Web applications typically use sessions to maintain login state between
 * requests.  For example, a user will authenticate by entering credentials into
 * a form which is submitted to the server.  If the credentials are valid, a
 * login session is established by setting a cookie containing a session
 * identifier in the user's web browser.  The web browser will send this cookie
 * in subsequent requests to the server, allowing a session to be maintained.
 *
 * If sessions are being utilized, and a login session has been established,
 * this middleware will populate `req.user` with the current user.
 *
 * Note that sessions are not strictly required for Passport to operate.
 * However, as a general rule, most web applications will make use of sessions.
 * //大多应用会利用sessions
 * 下面这句话有点意思，但是这个例外在于一个api server，每个请求都要验证请求头。
 * 难道我们现在不是api server？
 * 看到下面这篇文章，https://www.freecodecamp.org/news/what-is-an-api-in-english-please-b880a3214a82/
 * 又多点理解，原注释中的api server意思应该是返回数据的接口，而不是做网站的接口。返回数据的接口每次都需要添加token，像微信那样要添加用户信息和密钥
 * An exception to this rule would be an API server, which expects each HTTP
 * request to provide credentials in an Authorization header.
 *
 * Examples:
 *
 *     app.use(connect.cookieParser());
 *     app.use(connect.session({ secret: 'keyboard cat' }));
 *     app.use(passport.initialize());
 *     app.use(passport.session());
 *
 * Options:
 *   - `pauseStream`      Pause the request stream before deserializing the user
 *                        object from the session.  Defaults to _false_.  Should
 *                        be set to true in cases where middleware consuming the
 *                        request body is configured after passport and the
 *                        deserializeUser method is asynchronous.
 *
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */
Authenticator.prototype.session = function(options) {
  //所以调用了session方法后会进行这个方法，同样这个方法会暴露出去，比如用在local里面
  //而这个放啊还是依赖fremawork，默认是没options也能用，所以关键看下session参数什么意思@todo
  return this.authenticate("session", options);
};

// TODO: Make session manager pluggable
/*
Authenticator.prototype.sessionManager = function(mgr) {
  this._sm = mgr;
  return this;
}
*/

/**
 * Registers a function used to serialize user objects into the session.
 *
 * Examples:
 *
 *     passport.serializeUser(function(user, done) {
 *       done(null, user.id);
 *     });
 *
 * @api public
 */
Authenticator.prototype.serializeUser = function(fn, req, done) {
  if (typeof fn === "function") {
    return this._serializers.push(fn);
  }

  //私有调用
  // private implementation that traverses the chain of serializers, attempting
  // to serialize a user
  var user = fn;

  // For backwards compatibility
  if (typeof req === "function") {
    done = req;
    req = undefined;
  }

  var stack = this._serializers;
  //从第一个方法开始，一直往下，第一个开始
  (function pass(i, err, obj) {
    // serializers use 'pass' as an error to skip processing
    if ("pass" === err) {
      err = undefined;
    }
    // an error or serialized object was obtained, done
    //如果已经获取到了，则进行这里done，
    //在sessionmanage的login里面，这个done有调用
    //
    if (err || obj || obj === 0) {
      return done(err, obj);
    }
    //第一层
    var layer = stack[i];
    //如果没有则报错
    if (!layer) {
      return done(new Error("Failed to serialize user into session"));
    }

    //一个serilizer函数用完就继续调用下一个
    //这个方法就是例子中的作为参数的回调函数，
    //有个done，而done就是这个serialized
    //调用serialized并且把一个object放进去，说明已经获取到了
    //就是有点绕啊
    function serialized(e, o) {
      pass(i + 1, e, o);
    }

    try {
      //根据注册函数的参数来给东西
      var arity = layer.length;
      if (arity == 3) {
        layer(req, user, serialized);
      } else {
        layer(user, serialized);
      }
    } catch (e) {
      return done(e);
    }
  })(0);
};

/**
 * Registers a function used to deserialize user objects out of the session.
 *
 * Examples:
 *
 *     passport.deserializeUser(function(id, done) {
 *       User.findById(id, function (err, user) {
 *         done(err, user);
 *       });
 *     });
 *
 * @api public
 */
Authenticator.prototype.deserializeUser = function(fn, req, done) {
  //这里的方法是提供给用的
  if (typeof fn === "function") {
    //这里已经return了，所以就是把方法放进去而已
    return this._deserializers.push(fn);
  }

  //会用多个方法解析一个用户名字？
  // private implementation that traverses the chain of deserializers,
  // attempting to deserialize a user
  var obj = fn;

  // For backwards compatibility
  if (typeof req === "function") {
    done = req;
    req = undefined;
  }

  var stack = this._deserializers;
  //从0开始
  (function pass(i, err, user) {
    // deserializers use 'pass' as an error to skip processing
    if ("pass" === err) {
      err = undefined;
    }
    // an error or deserialized user was obtained, done
    if (err || user) {
      return done(err, user);
    }
    // a valid user existed when establishing the session, but that user has
    // since been removed
    if (user === null || user === false) {
      return done(null, false);
    }

    var layer = stack[i]; //被用户放进去的deserializeUser
    if (!layer) {
      return done(new Error("Failed to deserialize user out of session"));
    }

    function deserialized(e, u) {
      pass(i + 1, e, u);
    }

    try {
      //对用户行为尽心错误捕捉
      var arity = layer.length;
      if (arity == 3) {
        layer(req, obj, deserialized);
      } else {
        layer(obj, deserialized);
      }
    } catch (e) {
      return done(e);
    }
  })(0);
};

/**
 * Registers a function used to transform auth info.
 *
 * In some circumstances authorization details are contained in authentication
 * credentials or loaded as part of verification.
 *
 * For example, when using bearer tokens for API authentication, the tokens may
 * encode (either directly or indirectly in a database), details such as scope
 * of access or the client to which the token was issued.
 *
 * Such authorization details should be enforced separately from authentication.
 * Because Passport deals only with the latter, this is the responsiblity of
 * middleware or routes further along the chain.  However, it is not optimal to
 * decode the same data or execute the same database query later.  To avoid
 * this, Passport accepts optional `info` along with the authenticated `user`
 * in a strategy's `success()` action.  This info is set at `req.authInfo`,
 * where said later middlware or routes can access it.
 *
 * Optionally, applications can register transforms to proccess this info,
 * which take effect prior to `req.authInfo` being set.  This is useful, for
 * example, when the info contains a client ID.  The transform can load the
 * client from the database and include the instance in the transformed info,
 * allowing the full set of client properties to be convieniently accessed.
 *
 * If no transforms are registered, `info` supplied by the strategy will be left
 * unmodified.
 *
 * Examples:
 *
 *     passport.transformAuthInfo(function(info, done) {
 *       Client.findById(info.clientID, function (err, client) {
 *         info.client = client;
 *         done(err, info);
 *       });
 *     });
 *
 * @api public
 */
Authenticator.prototype.transformAuthInfo = function(fn, req, done) {
  if (typeof fn === "function") {
    return this._infoTransformers.push(fn);
  }

  // private implementation that traverses the chain of transformers,
  // attempting to transform auth info
  var info = fn;

  // For backwards compatibility
  if (typeof req === "function") {
    done = req;
    req = undefined;
  }

  var stack = this._infoTransformers;
  (function pass(i, err, tinfo) {
    // transformers use 'pass' as an error to skip processing
    if ("pass" === err) {
      err = undefined;
    }
    // an error or transformed info was obtained, done
    if (err || tinfo) {
      return done(err, tinfo);
    }

    var layer = stack[i];
    if (!layer) {
      // if no transformers are registered (or they all pass), the default
      // behavior is to use the un-transformed info as-is
      return done(null, info);
    }

    function transformed(e, t) {
      pass(i + 1, e, t);
    }

    try {
      var arity = layer.length;
      if (arity == 1) {
        // sync
        var t = layer(info);
        transformed(null, t);
      } else if (arity == 3) {
        layer(req, info, transformed);
      } else {
        layer(info, transformed);
      }
    } catch (e) {
      return done(e);
    }
  })(0);
};

/**
 * Return strategy with given `name`.
 *
 * @param {String} name
 * @return {Strategy}
 * @api private
 */
Authenticator.prototype._strategy = function(name) {
  return this._strategies[name];
};

/**
 * Expose `Authenticator`.
 */
module.exports = Authenticator;
