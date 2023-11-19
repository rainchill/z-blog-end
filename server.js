var express = require('express')
var mockjs = require('mockjs')
const cors = require('cors')
var bodyParser = require('body-parser')
var multer = require('multer')
const path = require('path')
var fs = require('fs')
var storage = multer.diskStorage({
    // 文件存储的位置
    destination: function (req, file, cb) {
      cb(null, __dirname+'/upload');
    },
    // 文件重命名
    filename: function (req, file, cb) {
      console.log(file)
        //   cb(null,  file.originalname);
      cb(null,  Buffer.from(file.originalname, "latin1").toString("utf8"));
      // cb(null, file.fieldname + '.jpg');
    },
    // filename: function(req, file, cb) {
    //     // const fileFormat = (file.originalname).split('.') // 取后缀
    //     // let fileName = file.fieldname + '-' + Date.now() + ext;
    //     // 解决中文名乱码的问题
    //     file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8")
    //     let fileName = file.originalname
    //     // 判断文件是否存在
    //     // fs.access(fileName, error => {
    //     //     if (!error) {
    //     //         // The check succeeded
    //     //         //fileName就是上传文件的文件名
    //     //         cb(null, fileName);
    //     //     } else {
    //     //         // The check failed
    //     //         let ext = path.extname(file.originalname);
    //     //         let basename = path.basename(file.originalname)
    //     //         let str = basename.split("."); // 以‘.’分割；
    //     //         fileName = str[0] + '-' + Date.now() + ext;
    //     //         //fileName就是上传文件的文件名
    //     //         cb(null, fileName);
    //     //     }
    //     // })
    // }
  })
const upload = multer({ storage: storage })
// const upload = multer({ dest: path.join(__dirname, '/upload') })

var app = express()
//处理跨域问题
app.use(cors())
//处理POST请求的
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const { Sequelize, DataTypes, Model } = require('sequelize');
const { constrainedMemory } = require('process')


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
        defaultValue:"xxxxxxxxx\nxxxxxxxxx1111111111111111111111111\n111111112"
    }
}, {
    freezeTableName: true
})

const creatForm = async () => {
    console.log("creat Articles sql table 1111")
    await Articles.sync({force: true})
    console.log("creat Articles sql table")
}

creatForm().then(() => {
    const t = Articles.build({ ztitle: "asdadad" });
    t.save()
})
function sleep(time){
    var timeStamp = new Date().getTime();
    var endTime = timeStamp + time;
    while(true){
    if (new Date().getTime() > endTime){
     return;
    } 
    }
}

const t = Articles.build({ ztitle: "asdadad" });
t.save()

// ret = Articles.findAll({
//     attributes: ['ztitle'],
//     raw: true
// })

// console.log("ret = ", ret)





// setTimeout(function(){ console.log('----art=', articleslist) }, 1000);

console.log("save success!")

app.get('/articles', function (req, res) {
    async function sendArticles(obj) {
        // 查询所有用户
        const articles = await Articles.findAll();
        for( p of articles ) {
            // 隐藏bug xxx.xxx.xxx
            
            obj.articleslist.push(
                {id: p.dataValues.id, title: p.dataValues.ztitle.split(".")[0], discribe: p.dataValues.zcontent.toString().split('\n')[0]}
            )
        }
        obj.articleslist.reverse()
        // console.log("obj:", obj)
    }

    x = { articleslist:[] }
    sendArticles(x).then(() => {
        // console.log("2221111:", x)
        // console.log("send json:", JSON.stringify(x.articleslist))
        res.send(JSON.stringify(x.articleslist))
    })


    

    // res.send(mockjs.mock({
    //         "list|8": [
    //         {
    //             "id": '@increment(1)',
    //             "title": "@ctitle",
    //             "content": "@cparagraph",
    //             "add_time": "@date(yyyy-MM-dd hh:mm:ss)"
    //         }
    //         ]
    // }))
})

app.get('/articles/:id', function (req, res) {
    // console.log("send page")
    // console.log("id=",req.params.id)
    

    // res.send(mockjs.mock({
    //     "title": "@ctitle",
    //     "content": "@cparagraph",
    //     "add_time": "@date(yyyy-MM-dd hh:mm:ss)"
    // }))
    x = { article:{} }
    async function seeArticle(obj) {
        const article = await Articles.findOne({ where: { id: req.params.id } })
        if(article === null) {
            return
        }
        // console.log("aaa=",article)
        obj.article = {"title": article.dataValues.ztitle.split(".")[0], "content": article.dataValues.zcontent}
        // console.log("ooobj=",obj)
    }

    seeArticle(x).then(() => {
        res.send(x.article)
    })
})

app.post('/api/admin/uploadfile',  upload.single('file'), function (req, res) {
    res.send({ file: "ok" })
    // filename = Buffer.from(req.file.filename, "latin1").toString("utf8");
    if ("md" === req.file.filename.split(".")[1]) {
        fs.readFile("./upload/" + req.file.filename, function(err, data) {
            if (err) {
                return console.error(err)
            }
            // console.log("异步读取:", data.toString())
            insert_sql = (async () => {
                console.log("insert sql")
                await Articles.create({
                    ztitle: req.file.filename,
                    zcontent: data.toString()
                })
            })()
        })
    }
})

app.post('/api/admin/delete', function (req, res) {
    console.log("-------", req.body.deleteList)
    var deleteList = req.body.deleteList.map(v => v+'.md')
    for (const v of deleteList) {
        (async () => {
            await Articles.destroy({
                where: {
                    ztitle: v
                }
            })
        }) ()
    }
    res.send({ code: "ok" })
})




app.get('/api/admin/articleslist', function (req, res) {

    async function getArticleslist(obj) {
        // 查询所有用户
        const articles = await Articles.findAll();
        for( p of articles ) {
            // 隐藏bug xxx.xxx.xxx
            // console.log("p:", p.dataValues.zcontent.toString().split('\n')[0])
            obj.articleslist.push(p.dataValues.ztitle.split(".")[0])
        }
        obj.articleslist.reverse()
        console.log("obj:", obj)
    }

    x = { articleslist:[] }
    getArticleslist(x).then(() => {
        // console.log("x =", x.articleslist)
        res.send(JSON.stringify(x.articleslist))
    })

})

app.get('/api/admin/delete', function (req, res) {
    
})

app.listen(8000, "127.0.0.1")