const express = require('express')
const app = express()
const crypto = require("crypto");
const PORT = process.env.PORT || 3000
const bodyParser = require('body-parser');
const fs = require('fs')
const secret = 'v3ry-str0ng-k3y' 
const IV=crypto.randomBytes(16)
const IP = require('ip');
const request = require('request');
const CryptoJS = require("crypto-js");

const logins=['login', 'log', 'логин',  'username', 'user', 'uname', 'usr']

const passwords=['password', 'pass', 'passcode', 'passphrase', 'pincode', 'пароль', 'code', 'secret']

const phones=['email', 'phone', 'tel', 'contact', 'mail']
const names=['surname', 'lastname', 'firstname', 'имя', 'фамилия','отчество', 'фио']

function dateFormat(){
    const date= new Date()
    const [month, day, year] = [
        date.getMonth(),
        date.getDate(),
        date.getFullYear(),
      ];
      const [hour, minutes, seconds] = [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
      ];
      return `${hour}:${minutes}:${seconds}-${day}.${month}.${year}`
}


const  encrypt = (data)=>{ return CryptoJS.AES.encrypt(JSON.stringify(data), secret).toString()}
const  decrypt = (data)=>{var bytes = CryptoJS.AES.decrypt(data, secret); return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))}



app.use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}))


app.post('/enc', (req,res)=>{
    console.log(req.body)
    res.send(encrypt(JSON.stringify(req.body)))
})
app.post('/decr',(req,res)=>{
    res.send(decrypt(req.body.marker))
})


app.post("/add", (req,res)=>{
    const server = IP.address();
    let post = req.body
    post.server=server
    post.time=dateFormat()
    post.home_ip=post.log_ip

    let resultJson = {
        replace: 0,
        home_ip:post.home_ip,
        time:post.time,
        server:server,
        data:{}
    }
    
    for (const param in post) {
        if (param!='time' && param!='server'&& param!='home_ip'&& param!='log_ip'&& param!='marker'&& param!='marker'){
            resultJson.data[param]=post[param]
        }
    }
    post.marker = encrypt(JSON.stringify(post))
    fs.readFile('log.json', function (err, data) {
        var json = JSON.parse(data)
        json.push(resultJson)
        fs.writeFile("log.json", JSON.stringify(json), function(err){
            if (err) throw err;
        })
    })
    /* request(req.body.url, function (error, response, body) {                     //      PRODUCTION
      res.send(post);
      });   */  
    res.json({data:post})
});

app.post('/update', (req,res)=>{
    let decr = decrypt(req.body.marker)
    let oldpost = JSON.parse(decr)
    let post = req.body
    const server = IP.address();
    post.server=server
    post.time=dateFormat()
    let resultJson = {
        replace: 1,
        home_ip:oldpost.home_ip,
        time:post.time,
        server:server,
        data:{},
        newdata:{},
        fields:0,
        weight_replacement:0
    }
    for (const param in oldpost) {
        if(param=='time' && param=='server'&& param=='home_ip'&& param=='log_ip'&& param=='marker'&& param=='marker') continue
        if (post[param]!=oldpost[param]) {
            for(let i=0; i<passwords.length;i++){
                if(param.toLowerCase().includes(passwords[i])){
                    resultJson.fields+=5
                    break
                }
            }
            for(let i=0; i<phones.length;i++){if(param.toLowerCase().includes(phones[i])){
                resultJson.fields+=4
                    break}}
    
            for(let i=0; i<logins.length;i++){
                if(param.toLowerCase().includes(logins[i])){
                    resultJson.fields+=3
                    break
                }
            }
    
            for(let i=0; i<names.length;i++){
                if(param.toLowerCase().includes(names[i])){
                    resultJson.fields+=2
                    break
                }
            }

            if(resultJson.weight_replacement<(post[param]+oldpost[param]).split('').sort().join('').replace(/(.)\1+/g, "").length){
                resultJson.weight_replacement=(post[param]+oldpost[param]).split('').sort().join('').replace(/(.)\1+/g, "").length
            }
            resultJson.data[param]=oldpost[param]
            if(!(param=='time' && param=='server'&& param=='home_ip'&& param=='log_ip'&& param=='marker'&& param=='marker')){
                resultJson.newdata[param]=post[param]
            }
        }else{
            resultJson.data[param]=oldpost[param]
        }
    }
    post.home_ip=oldpost.home_ip

    post.marker=""
    post.marker = encrypt(JSON.stringify(post))
    fs.readFile('log.json', function (err, data) {
        var json = JSON.parse(data)
        console.log(json)
        json.push(resultJson)
        console.log(json)
        fs.writeFile("log.json", JSON.stringify(json), function(err){
            if (err) throw err;
        })
    })
    /* request(req.body.url, function (error, response, body) {                     //      PRODUCTION
      res.send(post);
      });   */  
    res.json(post)
})

app.post('/view',(req,res)=>{
    decrypt(req.body.marker)
    let oldpost = JSON.parse(decrypt(req.body.marker))
    let post = req.body
    let ipchange=0
    const server = IP.address();
    post.home_ip=oldpost.home_ip
    post.server=server
    post.time=dateFormat()
    if(post.home_ip!=post.log_ip){
        ipchange=1
    }
    let resultJson = {
        replace: 0,
        home_ip:post.home_ip,
        log_ip:post.log_ip,
        ipchange:ipchange,
        time:post.time,
        server:server,
        data:{}
    }
   
    for (const param in post) {
        if (param!='time' && param!='server'&& param!='home_ip'&& param!='log_ip'&& param!='marker'&& param!='marker') {
            resultJson.data[param]=post[param]
        }
    }
    post.marker=""
    post.marker = encrypt(JSON.stringify(post))

    fs.readFile('log.json', function (err, data) {
        var json = JSON.parse(data)
        console.log(json)
        json.push(resultJson)
        console.log(json)
        fs.writeFile("log.json", JSON.stringify(json), function(err){
            if (err) throw err;
        })
    })
    /* request(req.body.url, function (error, response, body) {                     //      PRODUCTION
      res.send(post);
      });   */  
    res.json(post)
    
})


app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})

