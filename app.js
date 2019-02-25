'use strict';

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/learnMongodb');
const con = mongoose.connection;
con.on('error', console.error.bind(console, '连接数据库失败'));
con.once('open', () => {
    //成功连接
    let Schema = mongoose.Schema({
        category:String,
        name:String
    });
    Schema.methods.eat = function(){
        console.log("I've eatten one "+this.name);
    }
    //继承一个schema
    let Model = mongoose.model("fruit",Schema);
    //生成一个document
    let apple = new Model({
        category:'apple',
        name:'apple'
    });
    //存放数据
    apple.save((err,apple)=>{
        if(err) return console.log(err);
        apple.eat();
        //查找数据
        Model.find({name:'apple'},(err,data)=>{
            console.log(data);
        })
    });
})