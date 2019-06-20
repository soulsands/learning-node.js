## Mongoose

### schema

> Everything in Mongoose starts with a Schema. Each schema maps to a MongoDB collection and defines the shape of the documents within that collection. 

schema可以是模式，概要的意思，在这里用来作为collection格式的定义。schema是mongoose对象上的一个方法，本身又是构造函数，通过构造函数来创建schema。schema的作用很大。

> Schemas not only define the structure of your document and casting of properties, they also define document [instance methods](https://mongoosejs.com/docs/guide.html#methods), [static Model methods](https://mongoosejs.com/docs/guide.html#statics), [compound indexes](https://mongoosejs.com/docs/guide.html#indexes), and document lifecycle hooks called [middleware](https://mongoosejs.com/docs/middleware.html). 

`从趋势来看,  mongoose这一类的东西会让上手变复杂，但使用起来却会更方便些。` 

schema对应collection，定义文档的结构，包括数据的结构和数据的类型。在这里面model可以对应工厂的模具

```js
var Kitten = mongoose.model('Kitten', kittySchema);

    var silence = new Kitten({
        name: 'Silence'
    });
```

上面的过程就是用模具来制造一个猫，而在此之前，还有一个模型的模型，就是schema，可以说是一种设计。模型的设计。

所以mongoose的流程是，先设计（schema），设计完后制造模型（mongoose.model），之后再用模型生产文档（实例，instance）。

在设计阶段，实例的形状大小硬度作用已经被决定了。

把握这个大方向，继续向前理解。

#### model

作为model，在定义的时候是首字母大写的，但保存进数据库时被mongoose改成了小写加负数形式。	

#### [Instance methods](https://mongoosejs.com/docs/guide.html#methods)

- 定义方法时不要用箭头函数，不然里面的this会绑定不上。

大概也是继承的方式而已。是实例所使用的，里面的this指向实例，就是文档，如果要获取到集合，就是model，似乎用.model方法。

如何使用？

这个里好像可以定义一些通用的方法，比如找到统计所有人的名字出现的次数，或者别的储存数据的方法？	

#### static

```js
  animalSchema.statics.findByName = function(name, cb) {
    return this.find({ name: new RegExp(name, 'i') }, cb);
  };

  var Animal = mongoose.model('Animal', animalSchema);
  Animal.findByName('fido', function(err, animals) {
    console.log(animals);
  });
```

方法是model来使用的，那这个属于构造函数的静态方法。

#### query helpers

查询助手。

目前看来似乎是是查询mongodb中的条件操作符，可以指定更多的查询条件。

#### indexes

索引，创立索引。据说会自动创立索引，但会影响性能，建议不要自动开启。

#### virtuals

提供一个setter和getter。如果用setter建议用来格式化数据，比如时间、姓名等等来拼接的，而getter据说，可以用来把一个数据改成多个数据。

通过virtual技术实现一个alias的作用，就是可以省宽带（原话），将比较少的字母存进数据库，但是读出来的时候是正常的。

#### schema的参数

有点恐怖有点多。

- autoindex

生产环境最好去掉，如果想好好管理的数据库的话。

- autoCreate

自动创建。默认是false，开发环境中设置true并且设置capped会对开发有帮助，大概是会提高效率的。在创建的时候会遵循校对规则。`collation` ，这个东西后面会讲。

- bufferCommands

  缓冲指令，但不知道有什么用。`发现是用来可以把model操作先缓存起来，等数据库连接了再执行。可以通过把操作放到事件里面，然后连接的时候查看状态，如果有操作则执行` 

- capped

设置固定集合的。

- collection

指定集合的名字的，不然会调用一个toCollectionName方法去转换model名字为集合名字。大概是大写开头变小写，并且加上s。

有一个pluralize的方法，就是复数的意思。这套规则不但作为代码还不错，作为英语学习也是相当好的。

```js
exports.pluralization = [
  [/(m)an$/gi, '$1en'],
  [/(pe)rson$/gi, '$1ople'],
  [/(child)$/gi, '$1ren'],
  [/^(ox)$/gi, '$1en'],
  [/(ax|test)is$/gi, '$1es'],
  [/(octop|vir)us$/gi, '$1i'],
  [/(alias|status)$/gi, '$1es'],
  [/(bu)s$/gi, '$1ses'],
  [/(buffal|tomat|potat)o$/gi, '$1oes'],
  [/([ti])um$/gi, '$1a'],
  [/sis$/gi, 'ses'],
  [/(?:([^f])fe|([lr])f)$/gi, '$1$2ves'],
  [/(hive)$/gi, '$1s'],
  [/([^aeiouy]|qu)y$/gi, '$1ies'],
  [/(x|ch|ss|sh)$/gi, '$1es'],
  [/(matr|vert|ind)ix|ex$/gi, '$1ices'],
  [/([m|l])ouse$/gi, '$1ice'],
  [/(kn|w|l)ife$/gi, '$1ives'],
  [/(quiz)$/gi, '$1zes'],
  [/s$/gi, 's'],
  [/([^a-z])$/, '$1'],
  [/$/gi, 's']
];
var rules = exports.pluralization;

/**
 * Uncountable words.
 *
 * These words are applied while processing the argument to `toCollectionName`.
 * @api public
 */

exports.uncountables = [
  'advice',
  'energy',
  'excretion',
  'digestion',
  'cooperation',
  'health',
  'justice',
  'labour',
  'machinery',
  'equipment',
  'information',
  'pollution',
  'sewage',
  'paper',
  'money',
  'species',
  'series',
  'rain',
  'rice',
  'fish',
  'sheep',
  'moose',
  'deer',
  'news',
  'expertise',
  'status',
  'media'
];
var uncountables = exports.uncountables;

/*!
 * Pluralize function.
 *
 * @author TJ Holowaychuk (extracted from _ext.js_)
 * @param {String} string to pluralize
 * @api private
 */

function pluralize(str) {
  var found;
  str = str.toLowerCase();
  if (!~uncountables.indexOf(str)) {
    found = rules.filter(function(rule) {
      return str.match(rule[0]);
    });
    if (found[0]) {
      return str.replace(found[0][0], found[0][1]);
    }
  }
  return str;
}
```

如果不完全是mongoose来操作，可以指定集合名称，不然会乱掉。

- id

如果不开启的话，在实例上不会通过这个字段去获取objectid的。

- _id

可以实现不保存默认的_id字段，但是只能在subdocment（大概为子文档），因为mongodb在不知道id的时候不够保存。

```js
// disabled _id
var childSchema = new Schema({ name: String }, { _id: false });
var parentSchema = new Schema({ children: [childSchema] });

var Model = mongoose.model('Model', parentSchema);

Model.create({ children: [{ name: 'Luke' }] }, function(error, doc) {
  // doc.children[0]._id will be undefined
});
```

- minimize

默认不保存空的对象，如果设置为false，则会保存空对象。

- read

读取选项。貌似是指定优先读取的顺序，当链接多个数据库的时候可能需要这个。

- writeConcern

写关注机制。

现在倒不是很懂，需要去百度。这些配置的熟悉对于如何运用他们是非常重要的。

- shardkey

集群架构的时候用的。

- strict

默认true。如果是false，里面的字段可以不存在schema里面定义的。就是说可以出别的东西，也能保存。

- strictQuery

为了和前面的兼容，

- toJSON和toObject

可以转换成字符串的，转换成js对象的。有一些选项，比如当设置了getters为true，定义的getter则会执行。

- typeKey

默认是type字段来表示属性的type，但是如果有冲突，可以通过这个属性来改变。

- validateBeforeSave

默认是会检验是否合法，比如不能存储null，而设置为false之后好像可以储存。

- versionKey

> Note that Mongoose versioning is **not** a full [optimistic concurrency](https://en.wikipedia.org/wiki/Optimistic_concurrency_control) solution. Use [mongoose-update-if-current](https://github.com/eoin-obrien/mongoose-update-if-current) for OCC support. Mongoose versioning only operates on arrays: 

不是乐观并发解决方式？乐观并发锁。。好像是一种为了提供性能而让并发锁减少效力的方式，就是不一定能有效解决并发。

`这里强调，如果你不懂，别设置为false` 

> Mongoose *only* updates the version key when you use [`save()`](https://mongoosejs.com/docs/api.html#document_Document-save) 

别的方法不更新你的数据版本。

- collation

校对规则？比如大小写，甚至变音符号，类似法语字母头顶上上一撇。

- skipVersioning

不要瞎改除非你知道自己在做什么。

- timestamps

会自动新建时间，建立时间和修改时间都可以自动处理。

- useNestedStrict

如果不指定，子schema会遵循父schema的严格规则。

- selectPopulatePaths

自动填充路径，path在schema的种就是key，而自动填充路径。跟select方法有关，默认会帮忙填充别的路径。如果select是投射的方法，那这个就是选取某种东西了。

### schemaType

schema是model的配置对象，schemaType是指定path的类型，有没有getter/setter，怎么才是合法。

对于path可以指定类型，也可以指定很多别的配置。有些配置是所有type都可以用的，而不同type还会有些特定配置。

所有类型可有的配置如下：

- 是否必须，如果是必须的要添加验证规则。
- 默认值。
- 默认projection
- 验证规则
- get
- set
- 别名

总体来看，就设定这个值可以是什么（默认，验证），通过哪种方式获取（别名），获取后又做何加工（projection，get），至于set有什么用。

#### **indexes**

- index - 创建索引
- unique -  唯一索引，比如登录账户，用户名，可以用这个来保证。
- sparse - 松散索引，配合唯一索引使用时，比如说userCode是唯一并且松散的，如果一个doc没有userCode，其他key重复就没关系。

#### **String**

- lowercase
- uppercase
- trim
- match - 会判断是否符合这个正则
- enum - 枚举的意思，判断值是否在这个里面
- minlength
- maxlength

#### **Number**

- min  
- max

**Date**

- min
- max



String类型会调用toString方法，而Number类型会调用valueOf方法。

注意Data类型有点问题，如果你使用Data内置方法，比如setmonth来设置时间，mongoose不会监听到，所以需要用doc.markModified这个方法来告诉mongoose已经改变了。

mixed，混合类型。这个类型说明里面很可能出现不同类型的数据，这mongoose没有能力监听和获取它的变化，也需要用doc.markModified来处理一下。

boolen，甚至连yes和no都可以转换。

### connections

#### operation Buffering

如果有操作并且没有连接数据库，会先缓存起来，连接的时候再操作。

这个在schema里面有个选项了。也可以全局关闭这个选项

`mongoose.set('bufferCommands',false)`

- 用户密码

- `autoIndex`可以自动创建，但是据说如果数据太多就不太好。

- 数据库名称，

- 使用新的url解析器，这个默认要用上不然老是提示你。

- useCreateIndex，使用createIndex来作为建立索引的方法。

- 自动连接

- 尝试重连

- 一直重试重连

- findAndModify，这不知道是什么鬼。

- promiseLibrary，设置promise库，底层的

- poolsize，连接池？好像是说超过5个了，这个node.js的drive就不连接了？不知道是否如此。

- bufferMaxEntries -  貌似和bufferCommands相关的，就是说让你缓存多少个，如果设置为0的话，就会让没连接时候的操作立即失败。

- connectTimeoutMS - mongoodb 一个超时时间，这个默认是30秒，好像是说如果你的操作太久了，就要注意了。

- family

  >  If your `mongoose.connect(uri)` call takes a long time, try `mongoose.connect(uri, { family: 4 })` 

这些连接可以通过字符串，来指定，但是给mongoose的操作，是不行的，给mongodb的是可以的。具体是哪些，需要时再查。

连接有一大堆时间。开始连接，连接完成，要断连接了，已经断了。关闭。重连。出错

fullsetup和all，这两个好像和多集群有关。

- keepAlive

默认是开启的。还可以设置一个延迟时间，设置应用开启之后要多久才开启keepAlive。

### model

> Models are responsible for creating and reading documents from the underlying MongoDB database. 

model是用来读取和插入文档的。

```js

```

自动变成复数。

生产 document ，用new就好了。如果需要保存到数据库。有许多方法

- doc.save
- model.create
- model.insertMany

每个model都有一个相关的连接，用mongoose.model来制造doc，是用的默认连接。另外也可以弄一个自定的连接，而用这个自定的连接就会连到不同数据库。

#### **querying**

检索方法很多，具体的话要看query api。这里只是一笔带过。

#### **deleting**

deleteOne 和 deleteMany ，这连个是model的静态方法。

#### **updating**

这个方法会更新，但是不返回数据。如果需要返回，findOneAndUpdate是我想要的。

#### **change Streams**

据说可以监控model，如果有更新的话，可以返回。

### document

document和model的关系很密切，

```js
const MyModel = mongoose.model('Test', new Schema({ name: String }));
const doc = new MyModel();

doc instanceof MyModel; // true
doc instanceof mongoose.Model; // true
doc instanceof mongoose.Document; // true
```

>  The Model class is a subclass of the Document class.  

据说model类还是document的子类？？

当检索的时候，比如使用findOne，会获得一个doc，而这个doc就是和new Model出来的doc一样的。

#### **updating**

修改doc时候，如果再保存，mongoose会自动变成mongodb的更新操作。

据说通常情况下，更新操作要用save，你可以得到完整的验证和中间件。validation和middleware，后面会知道详情。

而另外几个操作，`update` `updateMany` `findOneAndUpdate` ，不会执行save的中间件，这个暂时不知道有啥意思。	

#### **validating**

这里并不清楚，可能还是要到后面才知道。这里说调用才。。。

### subdocuments

两种不同的表示方式。数组里面，单纯的折叠。

子文档，没什么区别。也有middleware,validation,virtuals，别的等等。但主要区别在于子文档不能单独保存，当前辈文档保存时它们就保存了。而middleware和validation，也是在前别组件保存时触发。

**finding a subdocument**

通过前辈文档找到子文档

```js
var doc = parent.children.id(_id)
```

这样一个方法就解决了。

有很多解决方式，这样有什么意义啊。

增加，删除，都有了。

2019.3.18 - 子文档的

### Queries

每个query操作返回一个query对象。

- [`Model.deleteMany()`](https://mongoosejs.com/docs/api.html#model_Model.deleteMany)
- [`Model.deleteOne()`](https://mongoosejs.com/docs/api.html#model_Model.deleteOne)
- [`Model.find()`](https://mongoosejs.com/docs/api.html#model_Model.find)
- [`Model.findById()`](https://mongoosejs.com/docs/api.html#model_Model.findById)
- [`Model.findByIdAndDelete()`](https://mongoosejs.com/docs/api.html#model_Model.findByIdAndDelete)
- [`Model.findByIdAndRemove()`](https://mongoosejs.com/docs/api.html#model_Model.findByIdAndRemove)
- [`Model.findByIdAndUpdate()`](https://mongoosejs.com/docs/api.html#model_Model.findByIdAndUpdate)
- [`Model.findOne()`](https://mongoosejs.com/docs/api.html#model_Model.findOne)
- [`Model.findOneAndDelete()`](https://mongoosejs.com/docs/api.html#model_Model.findOneAndDelete)
- [`Model.findOneAndRemove()`](https://mongoosejs.com/docs/api.html#model_Model.findOneAndRemove)
- [`Model.findOneAndUpdate()`](https://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate)
- [`Model.replaceOne()`](https://mongoosejs.com/docs/api.html#model_Model.replaceOne)
- [`Model.updateMany()`](https://mongoosejs.com/docs/api.html#model_Model.updateMany)
- [`Model.updateOne()`](https://mongoosejs.com/docs/api.html#model_Model.updateOne)

这些个查询可以放回调函数，也能用then来操作，但是有then并不是说它是promise，then这个方法会执行查询很多次。

```js
var Person = mongoose.model('Person', yourSchema);
// find each person with a last name matching 'Ghost', selecting the `name` and `occupation` fields
Person.findOne({ 'name.last': 'Ghost' }, 'name occupation', function (err, person) {
  if (err) return handleError(err);
  // Prints "Space Ghost is a talk show host".
  console.log('%s %s is a %s.', person.name.first, person.name.last,
    person.occupation);
});
```

返回一个query object，都会返回自己，所以进行链式操作。

```js
// With a JSON doc
Person.
  find({
    occupation: /host/,
    'name.last': 'Ghost',
    age: { $gt: 17, $lt: 66 },
    likes: { $in: ['vaporizing', 'talking'] }
  }).
  limit(10).
  sort({ occupation: -1 }).
  select({ name: 1, occupation: 1 }).
  exec(callback);

// Using query builder
Person.
  find({ occupation: /host/ }).
  where('name.last').equals('Ghost').
  where('age').gt(17).lt(66).
  where('likes').in(['vaporizing', 'talking']).
  limit(10).
  sort('-occupation').
  select('name occupation').
  exec(callback);

```

### **validation**

记住下面这些。

> - Validation is defined in the [SchemaType](https://mongoosejs.com/docs/schematypes.html)
> - Validation is [middleware](https://mongoosejs.com/docs/middleware.html). Mongoose registers validation as a `pre('save')` hook on every schema by default.
> - You can manually run validation using `doc.validate(callback)` or `doc.validateSync()`
> - Validators are not run on undefined values. The only exception is the [`required` validator](https://mongoosejs.com/docs/api.html#schematype_SchemaType-required).
> - Validation is asynchronously recursive; when you call [Model#save](https://mongoosejs.com/docs/api.html#model_Model-save), sub-document validation is executed as well. If an error occurs, your [Model#save](https://mongoosejs.com/docs/api.html#model_Model-save) callback receives it
> - Validation is customizable

会在save之前执行。

需要知道怎么定义，如果不符合就自定义报什么错，或者根据其他path的值来定义当前path的值是否必须，这些可以去查下。

**自定义验证规则**

**异步验证**

异步验证似乎有点奇怪，难道会等

**验证报错**

**必须验证**

**更新的验证**

据说更新操作默认是不验证的，包括 `update和findOneAndUpdate`两个方法。

但更新的验证和document的验证有区别，里面的运行机制不一样，所以两者的this不一样，

而更新操作篇幅较多，似乎可以对某些path以及某些operation来验证，

### middleware

又称为前置或后置钩子。在schema层面定义，对于写插件很有帮助。

一共有四种中间件。

doc,model,aggregate,query。

反正在使用的时候pre和post，当看到这两个东西的时候，知道他在干嘛就好了。

还有什么异步中间件。

还有同步中间件，而同步中间件只有init的方法。

### populate

殖民？填充?居住？

这个好像是对应mongodb的dbref，用来自动引用在集合中引用其他集合中的文档。

> Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s).  

这个应该是类似引用的意思，自动替换你所用的path。

在mongodb官方文档里面，通过指定`$ref`和`$id` 

```
{
   "_id":ObjectId("53402597d852426020000002"),
   "address": {
   "$ref": "address_home",
   "$id": ObjectId("534009e4d852427820000002"),
   "$db": "runoob"},
   "contact": "987654321",
   "dob": "01-01-1991",
   "name": "Tom Benzamin"
}

>var user = db.users.findOne({"name":"Tom Benzamin"})
>var dbRef = user.address
>db[dbRef.$ref].findOne({"_id":(dbRef.$id)})
```

像上面那样，等于可以获取到另外个集合的数据。

 [而mongoose的操作呢](https://mongoosejs.com/docs/populate.html)

先是创建了一个人物的实例-作者，叫做 ian fleming，保存之后返回这个id，创建一个story，story的field- authore就是作者的id。通过这种方式，两者保存起来了。

```js
Story.
  findOne({ title: 'Casino Royale' }).
  populate('author').
  exec(function (err, story) {
    if (err) return handleError(err);
    console.log('The author is %s', story.author.name);
    // prints "The author is Ian Fleming"
  });
```

先找到那个故事，通过故事找到作者的id，只要在查询的时候， 调用populate方法，值为author。因为先前定义schema的时候就定义好了ref，所以在这里populate的意思，应该是代表filed。获取到那个id，然后到之前定义的ref去找就好了。

#### what if there's no foreign document

如果没有的话就返回null了。

#### field Selection

通过`populate('authore','name')`这个就只返回一个属性，name

#### populating mutiple paths

如果populate的是同一个field，据说只有最后一个才有效。

#### query conditions and other options

What if we wanted to populate our fans array based on their age, select just their names, and return at most, any 5 of them? 

```js
Story.
  find(...).
  populate({
    path: 'fans',
    match: { age: { $gte: 21 }},
    // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
    select: 'name -_id',
    options: { limit: 5 }
  }).
  exec();

```

上面的例子，还是非常牛皮的。







### api

根据功能来划分api?



`node --inspect app.js` ,这种方式



## 问题

### 实例的this

实例的this肯定是实例本身，他的model方法和mongoose.model不一样。但是什么呢。mongoose.model是用来制造集合的。this.model可能会等于db.collection。

### 索引是什么？

索引大概是目录一样的东西，等于在操作的时候同时维护一个索引副本，类似图书馆的书籍分类，按一定规则操作，那么数据就有一定规律。

而使用时，似乎建议在常用的字段添加索引，比如你常常查询某个键，书的书名，那给书名添加索引会给查询书名的时候更快。作者也常常查询，那么也给添加索引。如果你同时查询书名和出版时间，据说可以添加复合索引。

索引如果添加unique，比如用户名，那么这个用户会在数据库层面保持不重复。

这个还有存疑，是不能插入存在相同属性值的文档，还是文档中不能存在相同属性呢？倾向于前者。duplicate values，那应该是值不能重复吧。

多键索引，如果是数组的话，会给数组里面所有的键都给添加索引。

过期索引。索引过期之后相应的数据会被删除?这个有点厉害，但是有啥用呢。

稀疏索引（sparse），据说插入数据的时候，已经存在了也可以插入成功，但是要独特索引混合起来才有用。

> You can combine the sparse index option with the unique index option to reject documents that have duplicate values for a field but ignore documents that do not have the indexed key. .

如果用了这方法，有index属性的doc不能重复添加，但如果没有被索引的键就还是可以插入。现在理解了。

[这篇文章不错，索引的使用](https://www.cnblogs.com/the-last-resort/p/3378715.html)

### Buffer

buffer是一种类数组，用数组来表示二进制的数据的的结构。跟ascii那些编码有关，比如一个中文占3个字节，将其转换成buffer之后会变成3个数字。也可以通过将这些数字转换成utf-8编码的方式，将其转变成中文。

### findAndModify

connection里面说有个配置，可以用这个来代替原生的方式。但搞不清是什么、

### poolsize

connection里面的。

### 分片技术

> 这时，我们就可以通过在多台机器上分割数据，使得数据库系统能存储和处理更多的数据。 

这个分片貌似是把数据放到多个数据库，有操作的时候，先一起去处理，然后谁处理好了就通知一声，大家就不用去管了。像流浪地球的饱和救援。

# monoose实践

查询