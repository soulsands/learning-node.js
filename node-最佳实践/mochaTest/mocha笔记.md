

## feelings

有些东西乍一看很难，但多多熟悉下还是会很舒服。

## 摘要

mocha本身只是一个可以对定义好的东西进行测试的库。

一个测试代码可能会像下面这样。

```js
const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require('../../index');

describe('# POST /api/users', () => {
    it('should create a new user', (done) => {
      request(app)
        .post('/api/users')
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(user.username);
          expect(res.body.mobileNumber).to.equal(user.mobileNumber);
          user = res.body;
          done();
        })
        .catch(done);
    });
  });
```

## 它的运行机制可能包括：

- 找到特定文件，然后类似nodejs提供__dirname变量，它也会提供一些局部的变量。

- 这些变量根据mocha配置的测试语言风格来定义，比如默认的bbd，会像上面这样。还有**TDD**, **Exports**, **QUnit**等等，又是另一番景象。

- 进行错误捕捉，可以通过内部的tra__catch来封装，而只要内部没有抛出错误，就判定此次判定通过。

- nodejs的asset模块，chai和shoud等等都是可以抛出错误对象。

- 嵌套定义：describe的嵌套只是提供提示信息，甚至不写describe也能进行检测。它的作用更像是实践上的好处，分块检测，好分析。

- 抛出错误分为同步和异步，如果是异步的，则需要通过指定done来判断执行的结束，而同步任务因为可以直接执行完，有错则自动被捕捉和抛出，所以不需要done。

- down的作用是查看是被如何调用，像上面代码，如果down被调用时候没有入参，则说明测试没问题；相反，一旦测试过程中出了错，最终都会被catch到然后将错误作为入参传给done。而done函数则根据入参中是否存在错误来判定当前测试例子是否通过。

- 如果使用async/await来测试是最推荐的，mocha本身封装了对函数中的错误捕捉，并不需要自己再去你捕捉错误。可以实现如下的写法。

  ```js
  it('#async function', async () => {
      let r = await hello();
      assert.strictEqual(r, 15);
  });
  
  ```

- 生命周期：写在describe外的生命周期是根级别的钩子，卸载describe里面的就是块级钩子。这些周期是特定时候调用特定名称的函数，如果存在，则调用，如果不存在就算了。

- double done检测：可以再实例上标记done调用的次数，已经调用了则报错。

- --deley：需要配置这个命令，会让全局多一个run函数，而这个函数会让注册的测试执行。

- pending test：在it函数之后不包括回调函数了，只要检测到没有回调，则标注为pending。用来作为一个提示，以后会做测试。

- only，skip等等。如果是describe级别，那改变配置；如果是it级别，则直接操作就行。

- retries：如果是端对端测试，比如要收到某些请求，可以用retries来多次调用，但单元测试不推荐用这个。应用场景主要是情况难以模拟的，而真实环境的层次有点多。

  



## 配置



## 实践

- skip和only都是指定哪些测试会跳过，哪些不会。说实话不知道啥用。文档有介绍

  > Be mindful not to commit usages of `.only()` to version control, unless you really mean it! To do so one can run mocha with the option `--forbid-only` in the continuous integration test command (or in a git precommit hook).

  说提交的时候不要搞only，通过一条命令可以实现。难道这些命令只是为了不用写注释？

- 如果需要在特定环境跳过某个测试，可以用`this.skip()`来实现。如果跳过了，这个测试会被当做pending，但如果什么都不写，那这个测试会被标记为通过。这是两者的差别。

- skip也可以再钩子函数里写，那就可以实现跳过一大堆测试。

- 动态测试。和常规的写法区别不大，但会在循环等过程中调用起来。

- 如果需要报错时给提示，可以查看growl选项，但要翻墙下载，暂时不弄。

- > ### `--allow-uncaught`
  >
  > By default, Mocha will attempt to trap uncaught exceptions thrown from running tests and report these as test failures. Use `--allow-uncaught` to disable this behavior and allow uncaught exceptions to propagate. Will typically cause the process to crash.
  >
  > This flag is useful when debugging particularly difficult-to-track exceptions.

  默认情况下只是捕捉错误并且把测试转为失败，这个过程可以让应用不崩溃。

- > ### `--full-trace`
  >
  > Enable "full" stack traces. By default, Mocha attempts to distill stack traces into less noisy (though still useful) output.
  >
  > This flag is helpful when debugging a suspected issue within Mocha or Node.js itself.

- 默认情况会用全局变量来测试，不过也可以require(mocha)之后再使用里面的变量，这种方式比较直观。

