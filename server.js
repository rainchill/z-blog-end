var express = require('express')
var mockjs = require('mockjs')
const cors = require('cors')
var bodyParser = require('body-parser')
var multer = require('multer')
const path = require('path')
const upload = multer({ dest: path.join(__dirname, '/uploads') })

var app = express()
//处理跨域问题
app.use(cors())
//处理POST请求的
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const { Sequelize, DataTypes, Model } = require('sequelize');


const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './data/data.db'
});

// async function sss() {
//     try {
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//     } catch (error) {
//     console.error('Unable to connect to the database:', error);
//     }
// }

// sss()

const Articles = sequelize.define('Articles', {
    ztitle: {
        type: DataTypes.STRING,
        defaultValue:"hello"
    },
    zcontent: {
        type: DataTypes.TEXT,
        defaultValue:"xxxxxxxxxxxxxxxxxxx"
    }
}, {
    freezeTableName: true
})

Articles.sync()

const t = Articles.build({ ztitle: "asdadad" });
t.save()

console.log("save success!")

app.get('/articles', function (req, res) {
    res.send(mockjs.mock({
            "list|8": [
            {
                "id": '@increment(1)',
                "title": "@ctitle",
                "content": "@cparagraph",
                "add_time": "@date(yyyy-MM-dd hh:mm:ss)"
            }
            ]
    }))
})

app.get('/articles/:id', function (req, res) {
    console.log("send page")
    res.send(mockjs.mock({
        "title": "@ctitle",
        "content": "@cparagraph",
        "add_time": "@date(yyyy-MM-dd hh:mm:ss)"
    }))
})

app.post('/files',  upload.single('file'), function (req, res) {
    res.send({ file: "ok" })
    console.log("req.body:", req.file.originalname)
})

app.get('/api/admin/articleslist', function (req, res) {
    
})

app.listen(8000, "127.0.0.1")