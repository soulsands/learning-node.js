### nodejs

曾闻,对一门语言的熟悉程度,就是看是否熟悉它的api.鉴于此,来收集一下node.js的api.简单来说就是看看nodejs有啥用.

有啥用,先创建一堆文件夹,用来做装demo的文件夹.

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

- mkdir这个方法,本身是不会一层层建立路径,如果终末文件夹的父文件夹不存在,就会报错,所以需要从头开始一层层建立.就用遍历的方法,把路径拆分
- 拆分之后用了缓存,
- try{}catch(){}可以让代码报错也执行下去,因为这里存在了之后是必定报错
- 异步的方法本身会捕捉错误,但异步之后文件夹的建立顺序会错乱,如果子文件夹在父文件夹之前建立,即使捕捉错误也建立不了
- 如果从面建立文件夹,然后报错了再往前面建立,等不报错再往后面建立,这个倒也可以.