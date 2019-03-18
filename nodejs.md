## nodejs

曾闻,对一门语言的熟悉程度,就是看是否熟悉它的api。鉴于此,来收集一下node.js的api。简单来说就是看看nodejs有啥用。

有啥用,先创建一堆文件夹,用来做装demo的文件夹。

```js
const fs = require("fs")
const path = require("path")

let folders = ['assert', 'buffer', 'child_process', 'cluster', 'console', 'crypto', 'dgram', 'dns', 'error', 'fs', 'global', 'http', 'https', 'module', 'net', 'os', 'path', 'process', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timer', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib']

let recursiveMkfolder = (function () {
    let pathCache = [];
    let pathStr = "";
    return function (path) {
        let pathArray = path.split('\\');
        pathArray.forEach(function (value, index) {
            pathStr = pathArray.slice(0,index+1).join("\\");
            if (!pathCache.includes(pathStr)) {
                // console.log(!pathCache.includes(pathStr));
                count++
                try{
                fs.mkdirSync(pathStr)
                }catch(e){
                }
                pathCache.push(pathStr);
            }
        })
        // console.log(pathCache);
    }
})()
folders.forEach((value) => {
    let folderPath = path.join(__dirname, "demos/", value);
    recursiveMkfolder(folderPath)
})
```

- mkdir这个方法，本身是不会一层层建立路径，如果终末文件夹的父文件夹不存在，就会报错，所以需要从头开始一层层建立.就用遍历的方法，把路径拆分
- 拆分之后用了缓存，
- try{}catch(){}可以让代码报错也执行下去，因为这里存在了之后是必定报错
- 异步的方法本身会捕捉错误，但异步之后文件夹的建立顺序会错乱，如果子文件夹在父文件夹之前建立，即使捕捉错误也建立不了
- 如果从面建立文件夹，然后报错了再往前面建立，等不报错再往后面建立，这个倒也可以.



--------

## mongodb

(明白该领域的概念，就算理解错了，也要建立好联系，之后可以纠正)

### 概念

简单理解，数据库是存放数据的东西，和笔记本，excel表之类的东西差不多。但数据库的作用肯定是大得多，对增删改查做了优化，在处理这些操作时，一个好的数据库，既要速度快，还得保证不出错。

- SQL（structured query lauguage ) 结构化查询语言

一种语言，也是一种标准，用来管理数据库。





关系型数据库:遵循ACID(酸)原则，记忆的时候可以理解为关系型数据库很酸，比较苛刻，严格。



- 事务

[数据库事务-百度百科](https://baike.baidu.com/item/%E6%95%B0%E6%8D%AE%E5%BA%93%E4%BA%8B%E5%8A%A1/9744607?fr=aladdin)

事务本身就是遵循ACID原则的一系列操作，如果不遵循这些操作，也称不上为“事务”。



- 原子性（atomicity)

> 原子性很容易理解，也就是说事务里的所有操作要么全部做完，要么都不做，事务成功的条件是事务里的所有操作都成功，只要有一个操作失败，整个事务就失败，需要回滚。 

原子性意味着这东西不可分割，就是说一个操作看起来分成两步或者多步，但每一步都会检测其他步骤是否完成，其中一个失败则全体失败。

> （进程崩溃，断电，网络故障，硬盘满，违反约束等） 

上面的东西是造成事务失败的例子。

- 一致性(consistency)

> 一致性也比较容易理解，也就是说数据库要一直处于一致的状态，事务的运行不会改变数据库原本的一致性约束。
>
> 例如现有完整性约束a+b=10，如果一个事务改变了a，那么必须得改变b，使得事务结束后依然满足a+b=10，否则事务失败。

上面的解释，看起来和原子性没什么区别，感觉不太好理解。

> 保证数据库的一致性是数据库管理系统的一项功能.比如有两个表(员工\职位),员工表中有员工代码、姓名、职位代码等属性，职位表中有职位代码、职位名称、职位等级等属性。你在其中员工表中进行了插入操作,你插入了一个新员工的信息，而这个新员工的职位是公司新创建的一个职位。如果没有一致性的保证，就会出现有这么一个员工，但是不知道他到底担当什么职责！这个只是它的一个小小方面。 

这里大致是，员工表的职位数据要和职位表中的职位对应上，如果没有对应上，说明哪里出了问题。这里的“一致性”解释更合理。

其约束性就是两个职位代码要对应。员工表增加之后，仍然要被约束，则要在职位表上建立对应职位。

> 用户a执行查询操作，需要3分钟，而用户b在3分钟内的某一刻修改了数据，问用户a看到的数据是否被修改所影响。答案是不影响。

如果需要造成影响，那么查询操作也许需要重新开始查询，因为程序不知道修改的数据是否存在于已经查询的数据中。但这个道理是否属于一致性的范畴？

如果花3分钟去修改数据，而你读取的话，肯定也不能读取修改中途的数据，因为万一要回滚，则数据就出错了。

> 有人认为，一致性是强加在ACID里凑数的。因为这个东西不是数据库要保证的，而是应用程序需要定义和关注的。有一些道理。
>
>  我们经常认为，主外键约束达成了某种一致性，你不能在子表里面插入父表没有的键值，这是数据库给保证了一致性，但是这种一致性也是根据业务由开发人员定义的。如果你向数据库插入违反业务逻辑的假数据，数据库并没有这种约束阻止你。所以，一致性是通过事务的其他特性(原子性，隔离性）达成的，它并不属于数据库和事务的属性。 

确实这种约束由开发人员定义，数据库本身不存在知道哪些数据会有依赖。

- 隔离性（独立性）（isolation） 

> 隔离性保证同时执行的事务是相互隔离的，它们不能互相影响。简言之，一个事务只能看到另一个事务开始之前或者结束之后的结果，不能看到任何中间状态，反之亦然。
>
> 结果就如同他们串行化（Serializability）完成一样，尽管实际上它们是并发运行的。隔离性分好几种级别，每一种隔离级别都在权衡性能和某种安全保障，This is a kind of trade-off.

上面的解释挺清楚了，如果同时修改某个数据，并行的事务要像串行一样，不会相互影响

- 持久性（durability）

所以关系数据库只能用磁盘来保存，而非关系型还会使用内存。为了保存，还会设置日志和归档日志，反正会想办法一直保存。

### 并发的问题

> 2．并发控制概述
>
> 事务是并发控制的基本单位，保证事务ACID的特性是事务处理的重要任务，而并发操作有可能会破坏其ACID特性。
>
> DBMS并发控制机制的责任：
>
> 对并发操作进行正确调度，保证事务的隔离性更一般，确保数据库的一致性。
>
> 如果没有锁定且多个用户同时访问一个数据库，则当他们的事务同时使用相同的数据时可能会发生问题。由于并发操作带来的数据不一致性包括：丢失数据修改、读”脏”数据（脏读）、不可重复读、产生幽灵数据。

- 数据丢失。同时修改通一个文档的时候，如果不搞好，最后一个会覆盖前面所有的。就像git里面的操作，当你提交前要记得pull。
- 脏数据。修改的过程中，数据被其他事务读取到了，保存之后当做最终版本，则之前被读取的数据为脏数据。如果加锁，则解决问题。
- 不可重复读。是在有修改的情况下。
- 产生幽灵数据。

### 附加参考

[关系型数据库事务一：概念](https://www.cnblogs.com/nativestack/p/ricky_datasys01.html)

[关系型数据库事务二：隔离级别](https://www.cnblogs.com/nativestack/p/ricky_datasys02.html)

事务隔离，如果并发变成串行就都解决了。。说得好。

关系型数据库很像git的精神



## 后端开发记录

### 创建目录



### mongodb连接

| Oracle                        | MongoDB          | Mongoose                 |
| ----------------------------- | ---------------- | ------------------------ |
| 数据库实例(database instance) | MongoDB实例      | Mongoose                 |
| 模式(schema)                  | 数据库(database) | mongoose                 |
| 表(table)                     | 集合(collection) | 模板(Schema)+模型(Model) |
| 行(row)                       | 文档(document)   | 实例(instance)           |
| rowid                         | _id              | _id                      |
| Join                          | DBRef            | DBRef                    |

> 通过上面的阐述,我们大概能知道了在Mongoose里面有哪几个基本概念。
>
> - Schema: 相当于一个数据库的模板。 Model可以通过mongoose。model 集成其基本属性内容。 当然也可以选择不继承。
> - Model: 基本文档数据的父类,通过集成Schema定义的基本方法和属性得到相关的内容。
> - instance: 这就是实实在在的数据了。 通过 new Model()初始化得到。
>
> 他们各自间是怎样的关系呢？ 下图可以清晰的说明, 以上3中实际上就是一个继承一个得到最后的数据





## 目前理解

理解非关系型数据库， 感觉还是要了解关系型数据库。

目前很多文章基本上是以理解关系型数据库为前提，大概是因为学校里面会学这个，大多数人从关系型数据库理解起。

理解一个新的概念，必须要和已有概念链接起来，谨记。

事物的出现，必定是为了解决特定问题的。解决问题的同时，本身也会引出问题。而如何解决多出来的问题，也会有占用很多篇幅。

关系型数据库如果有个核心点，抽象到数据库层面，首先他是个数据库。目的是为了管理数据。增删改查。所谓数据是一个逻辑起点。以数据为基础，延伸到数据库的方方面面。

数据是客体，而人是主体，数据库是为了满足人对数据的需求，而使用的工具。人对数据有什么需求？就朴素想法而言，可以有下面需求。

我需要把信息储存起来。我可以用笔，做笔记。但这样的做法问题在于

1. 写起来太慢了。
2. 并且难以有规律的输入。
3. 很可能写错。
4. 还有可能写重复。
5. 写了之后容易丢。
6. 查询数据很难。
7. 整理数据很难，难有效做有规律的加工。

在计算机出现之前，大部分的信息保存方式大概都是文字这样记录。包括普通人的日记，官方的编年史，生意人的账簿等等。其中常见并且有效率的保存方式应该是生意人的账簿，或者说会计系统。

会计系统在手工层面就已经非常成熟，通过设置恰如其分的科目，资金的流向和某一刻的情况都可以正确的反应。但会计的方式本身是牺牲了录入速度来换取正确性和检索效率。

这种方式自古以来有之，包括各种案宗卷宗，家谱，科研材料：严格遵守某种编码方式来输入数据，从而在提取数据的时候拥有便利。这个也是自然而然，就像语言一样，本质上是为了效率。就像语言不通的人可以手脚并用来互相沟通，但通过语言，共同遵守某种协议，交流可以顺利进行，就像雪山融化而成的溪。而协议，或说编码，也是这个世界的进化。

协议是乘法。

下面来看看，数据库拥有哪些协议，用以解决哪些管理数据而生的问题。

和人一样，计算机处理一个事情需要多方面配合的，cpu，内存和硬盘。但同时是个严格的人，收到指令之后就是死脑筋去做。

1. 原子性（atomicity)，原子性。比如可能因为太累，高血压突发，饿死，纸突然写满了，各种原因写不下去。这时候要取消写了一个半的内容，还原到之前的状态。大概像是另外一个人在监督，或者纸上面设定一个装置，如果这个人按了开始键没有按结束键，那在这段时期内，数据更改并不生效。
2. 隔离性（isolation)。一起写一本书或者做账的时候，当一个内容不能被同时修改的时候，就需要隔离，通过限制访问。从门口拿了钥匙开了门，进去之后处理完，再把钥匙放回原位。当然这是最严重的隔离，而如果有些数据可以一起处理，那或者可以一同进房间处理。
3. durability。持久性。如果写的人突然暴毙，数据还是不能丢。

---

从作用来看，写起来太慢了。可以通过提高人的性能和熟练度来增加，也可以改变数据的处理方式。就是好的数据库和机器。

有规律的输入，这个拥有了计算机语言肯定不在话下。

如果担心写错，在有很多协议的情况下可以尝试保证，制定一致性规则，但很多时候还是会写错。

重复的情况也一样解决。

至于查询和整理，本质上是一回事，需要通过结构的设计来提高效率。就像设计会计系统和图书管理系统。

总之，电脑数据库的出现尽量保证了客观因素的失误，并且可以通过一定验证规则来防止主观性的失误（一致性），是目前储存数据非常成熟的方式，各种各样的数据库让这个世界有规律地运行。

---------

昨天看了sql的语法，了解了增删改查的语法，但还欠缺对概念的认识。

就数据操作语言（DML)的语法而言，可以总结为定位和操作。先找到合适的定位，然后增删改查的操作，而语法遵循的是`编码中的可以省略的部分终将被省略` ，定位是用逻辑来定位的，比如数字大于，等于，小于，不等于，某个等于另一个可能或者不等于。总之，没有抽离逻辑的范畴。

今天看mongodb的概念，可和RDBMS比较一下。

关系数据库有时候在设计时候会分开，通过一个主键来将不同的表联合起来。

------

> 文档是一组键值(key-value)对(即 BSON)。MongoDB 的文档不需要设置相同的字段，并且相同的字段不需要相同的数据类型，这与关系型数据库有很大的区别，也是 MongoDB 非常突出的特点。 

关系数据库中会像excel表中一样，在创建的时候需要指定列的类型。而mongodb不需要，意味着更少的限制，是否说明在提取的时候会更麻烦？因为不能提前知道类型。（怎么感觉又有点javascript动态语言的意思)

其实从这个限制来看，mongodb的集合确实不能用表来形容了。表本身倾向有规范有规律的信息，而集合中的文档可以有不同结构，相同的列也不需要是相同类型。所以，命名恰合概念。

> 1. 文档中的键/值对是有序的。
> 2. 文档中的值不仅可以是在双引号里面的字符串，还可以是其他几种数据类型（甚至可以是整个嵌入的文档)。
> 3. MongoDB区分类型和大小写。
> 4. MongoDB的文档不能有重复的键。
> 5. 文档的键是字符串。除了少数例外情况，键可以使用任意UTF-8字符。

如果熟悉js可能会将json和对象类别，这里要说明的是键值对是有序的。

而区分大小写和不能有重复，这里和js的对象一致。

> 集合就是 MongoDB 文档组，类似于 RDBMS （关系数据库管理系统：Relational Database Management System)中的表格。
>
> 集合存在于数据库中，集合没有固定的结构，这意味着你在对集合可以插入不同格式和类型的数据，但通常情况下我们插入集合的数据都会有一定的关联性。

实际上类似的地方只在于集合和表共同处于数据库的这一层级，里面的功能和限制差别很大。后面也说明，可以插入不同格式和类型。

> ### capped collections

翻译可以盖盖子的集合，在创建的时候限制的大小，当文档数据插入超过这个大小时候就覆盖之前的数据。速度快，推荐用于固定大小的日志和某些缓存信息。

> 数据类型...

数据类型很多，甚至包括数组，对象（内嵌文档），code，正则，一些怪怪的类型。

目前不知道要如何储存，最终应该还是会转换成字符串去储存吧，再通过指定的类型。



> **注意:** 在 MongoDB 中，集合只有在内容插入后才会创建! 就是说，创建集合(数据表)后要再插入一个文档(记录)，集合才会真正创建。 

实际测试中，创建数据库也是如此，有数据了才会显示数据库。

`世界标准时 UTC` 

----------

虽说数据库是增删改查，但其中的操作可谓变化贼多。

这几个操作，首先都要定位，即找到需要操作的东西。

- 插入文档：直接从集合中插入即可。

更新文档，有update和save方法。update侧重在已有的数据上修改，而save强调用新的文档替换整个旧的文档，替换是通过指定_id来实现的。

在更新时候，如果没找到选定的记录，是否要当做新文档插入？这是个选项。

更新多条记录呢？这也是选项。

- 查询文档

也是从逻辑角度来判断的。即等于或者不等，另外包括大于小于和等于的4种组合。也可以通过and和or来组合，and就用逗号，or需要一个需要$or。在这里没有创造新的符号，整个语言风格非常像js。

- 可以指定值的类型
- limit和skip用来读取的时候限制和跳过某些数据。这些肯定是需求才出现的。
- 排序
- 索引

索引的实现大概是意味着某种排序，就是对数据先行进行整理。如同给一本书添加目录，从而在找内容时加快速度。如果是找数字，或者英文字母排序的，大概类似先按顺序排好。这样继续寻找时可以通过一些辅助算法，比如先从中间找，然后判断顺序，再从进一步位置的中间找。

- 聚合（aggregate ）

似乎跟合起来关系不大，真要说有什么合起来，只是一些操作，就像之前说的sor,skip,limit排序都成为聚合操作一种。这些操作集合起来肯定实现很变态的操作了。

- 复制

  看起来是备份用的，并不做太多用处。

- 分片

恐怖，设置集群的，用来搞分布式拓展的。这个好像也是mongodb的优势之一。



---

说是mongodb高级内容

- 关系

  `文档之间的关系` 

  如果要引用，先通过讲另一个集合的id，来当做当前集合一个键值对，再通过id去查询另一张表得出结果。和关系数据库差不多。

- 数据库引用

DBrefs算是一种自动引用，将其都当做变量，而关系一栏中讲的方式是手动引用。这个自动引用是通过



-----

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

-  定义方法时不要用箭头函数，不然里面的this会绑定不上。

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

###  connections

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

