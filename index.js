const express = require('express')
const app = express()
const crypto = require("crypto");
const PORT = process.env.PORT || 80
const bodyParser = require('body-parser');
const fs = require('fs')
const secret = crypto.randomBytes(32)
const IV=crypto.randomBytes(16)
const IP = require('ip');
const request = require('request');
const { exit } = require('process');


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

function encrypt(text) {
    const encryptalgo = crypto.createCipheriv('aes-256-cbc', secret,IV);
    let encrypted = encryptalgo.update(text, 'utf8', 'hex');
    encrypted += encryptalgo.final('hex');
    return encrypted;
}

function decrypt(encrypted) {
    const decryptalgo = crypto.createDecipheriv('aes-256-cbc', secret, IV);
    let decrypted = decryptalgo.update(encrypted, 'hex', 'utf8');
    decrypted += decryptalgo.final('utf8');
    return decrypted;
}


app.use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}))


app.get('/getIP', (req, res) => {
    const ipAddress = IP.address();
    res.send(ipAddress)
})

app.post("/add", (req,res)=>{
    const server = IP.address();
    let resultstring=''
    let post = req.body
    post.server=server
    post.time=dateFormat()
    post.home_ip=post.log_ip
    
    resultstring="replace=0 "
    for (const param in post) {
        if (Object.hasOwnProperty.call(post, param)) {
           resultstring+=param+"="+post[param]+" "
            
        }
    }
    post.marker = encrypt(JSON.stringify(post))
    resultstring+="\n"
    fs.appendFile(__dirname+"/log.txt",resultstring , function(err) {
        if(err) {
            return console.log(err);
        }
    }); 
    /* request(req.body.url, function (error, response, body) {                     //      PRODUCTION
      res.send(post);
      });   */  
    res.json({data:post})
});

app.post('/update', (req,res)=>{
    let oldpost = JSON.parse(decrypt(req.body.marker))
    let post = req.body
    const server = IP.address();
    post.server=server
    post.time=dateFormat()
    var fields=0
    let weight_replacement=0
    resultstring="replace=1 "
    for (const param in oldpost) {
        if(param=='marker' || param=='home_ip') continue

        passwords.forEach(element => {
            if(param.toLowerCase().includes(element)){
                fields+5
            }
        });

        logins.forEach(element => {
            if(param.toLowerCase().includes(element)){
                fields+4
            }
        });

        phones.forEach(element => {
            if(param.toLowerCase().includes(element)){
                fields+3
            }
        });

        names.forEach(element => {
            if(param.toLowerCase().includes(element)){
                fields+2
            }
        });

        if (post[param]!=oldpost[param] && param!='time' && param!='server') {
            if(weight_replacement<(post[param]+oldpost[param]).split('').sort().join('').replace(/(.)\1+/g, "").length){
                weight_replacement=(post[param]+oldpost[param]).split('').sort().join('').replace(/(.)\1+/g, "").length
            }
            resultstring+=param+"="+oldpost[param]+"=>"+post[param]  +" "
        }else{
            resultstring+=param+"="+post[param]+" "
        }
    }
    post.home_ip=oldpost.home_ip
    post.marker=""
    post.marker = encrypt(JSON.stringify(post))
    resultstring+="weight_replacement="+String(weight_replacement)+" fields="+ String(fields)+" home_ip="+oldpost.home_ip+"\n"
    fs.appendFile(__dirname+"/log.txt",resultstring , function(err) {
        if(err) {
            return console.log(err);
        }
    }); 
    /* request(req.body.url, function (error, response, body) {                     //      PRODUCTION
      res.send(post);
      });   */  
    res.json(post)
})

app.post('/view',(req,res)=>{
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
    let resultstring='replace=0 ipchange='+String(ipchange)+" "
    for (const param in oldpost) {
        if(param=='marker') continue
        
        if (post[param]!=oldpost[param] && param!='time' && param!='server') {
            resultstring+=param+"="+oldpost[param]+"=>"+post[param]  +" "
        }else{
            resultstring+=param+"="+post[param]+" "
        }
    }
    post.marker=""
    post.marker = encrypt(JSON.stringify(post))
    fs.appendFile(__dirname+"/log.txt",resultstring , function(err) {
        if(err) {
            return console.log(err);
        }
    }); 
    resultstring+="\n"
    /* request(req.body.url, function (error, response, body) {                     //      PRODUCTION
      res.send(post);
      });   */  
    res.json(post)
    
})


app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})

