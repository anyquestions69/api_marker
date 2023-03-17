const express = require('express')
const app = express()
const crypto = require("crypto");
const PORT = process.env.PORT || 80
const bodyParser = require('body-parser');
const fs = require('fs')
const secret = crypto.randomBytes(32)
const IV=crypto.randomBytes(16)
const IP = require('ip');
const request = require('request')


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
    post.date=dateFormat()
    post.url=""
    post.marker = encrypt(JSON.stringify(post))
    resultstring="added "
    for (const param in post) {
        if (Object.hasOwnProperty.call(post, param)) {
           resultstring+=param+"="+post[param]+" "
            
        }
    }
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
    post.date=dateFormat()
    resultstring="updated "
    for (const param in post) {
        if(param=='marker') continue
        if (post[param]!=oldpost[param] && param!='date' ) {
            resultstring+=param+"="+oldpost[param]+"=>"+post[param]  +" "
        }else{
            resultstring+=param+"="+post[param]+" "
        }
    }
    post.marker=""
    post.url=""
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
    res.json(post)
})

app.post('/view',(req,res)=>{

})


app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})

