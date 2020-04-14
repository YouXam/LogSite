const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const { join } = require('path');
const app = express();
const privateKey  = fs.readFileSync('./keys/private.pem', 'utf8');
const certificate = fs.readFileSync('./keys/file.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};
function send(text = "空消息", desp = '') {
    request({
        'method': 'POST',
        'url': 'https://sc.ftqq.com/SCKEY.send',
        formData: { 'text': text, 'desp': desp }
    });
}
function getTime() {
    const date = new Date()
    const y = date.getFullYear()
    const mo = date.getMonth() + 1
    const d = date.getDate()
    const h = date.getHours()
    const m = date.getMinutes()
    const s = date.getSeconds()
    return y + '-' + (mo < 10 ? '0' + mo : mo) + '-' + (d < 10 ? '0' + d : d) + ' ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    // res.header("Access-Control-Allow-Methods","POST,GET,OPTIONS");
    next();
});
app.get('/', (req, res) => {
    fs.readFile('data.json', function (err, raw) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.render('index', JSON.parse(raw));
    });
})
app.post("/", (req, res) => {
    if (!req.body.text) {
        res.status(400).send("Invalid arguments")
        return
    }
    send(req.body.text,req.body.desp)
    fs.readFile('data.json', function (err, raw) {
        data = JSON.parse(raw);
        data.list.splice(0, 0, {
            time: getTime(),
            text: req.body.text,
            desp: req.body.desp ? req.body.desp : "空"
        });
        fs.writeFile('data.json', JSON.stringify(data), () => {
            res.send('ok');
        })
    });
});
app.get('/download', (req, res) => {
    res.sendFile(join(__dirname, 'data.json'));
})
const httpsServer = https.createServer(credentials, app);
fs.exists("data.json", (exists) => {
    if (!exists) fs.writeFileSync("data.json", '{"list":[]}');
    httpsServer.listen(3000, function() {
        console.log('HTTPS Server is running');
    });
    // app.listen(3000, () => {
    //     console.log('服务器启动');
    // });
})
