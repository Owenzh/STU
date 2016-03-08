var express = require('express');
var router = express.Router();
var util = require('util');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/stu';
// Generate four random hex digits.
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};
// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};
/* 首页-登录. */
router.get('/', function (req, res, next) {
    //var MongoClient = require('mongodb').MongoClient;
    //var url = 'mongodb://localhost:27017/stu';
    //MongoClient.connect(url, function(err, db) {
    //    //assert.equal(null, err);
    //    console.log("Connected correctly to server.");
    //    var user = {
    //        u_id:guid(),
    //        u_name:"stu_admin",
    //        u_nickname:"admin",
    //        u_gender:"man",
    //        u_pwd:"admin123",
    //        u_role:"admin",
    //        u_mail:"stuadmin@stu.com",
    //        u_level:100
    //    };
    //    db.collection("tb_user").insertOne(user,function(err){
    //        console.log("Insert Admin user!!"+err);
    //        db.close();
    //        res.render('home', { title: '学生会管理系统' });
    //    });
    //
    //});

    res.render('home', {title: '学生会管理系统'});

});

/* 登录验证. */
router.all('/doLogin', function (req, res, next) {
    MongoClient.connect(url, function (err, db) {
        var ds = req.body;
        console.log("Connected correctly to server.");
        var filter = {
            u_name: ds.ipt_u_name,
            u_pwd: ds.ipt_u_pwd
        };
        var cursor = db.collection("tb_user").find(filter);
        cursor.toArray(function (err, docs) {
            if (err) throw err;
            if (docs.length > 0) {
                var role = docs[0]["u_role"];
                console.log("User correct!!!" + role);
                var roleLabel = [{label: "管理员"}, {label: "普通用户"}];
                var roleStr = "";
                var goWhere = "/";
                if (role == "admin") {
                    goWhere = "/admin";
                    roleStr = roleLabel[0].label;
                } else if (role == "user") {
                    goWhere = "/user";
                    roleStr = roleLabel[1].label;
                } else {
                    goWhere = "/";
                }
                res.clearCookie("stu_user_name");
                res.clearCookie("stu_user_id");
                res.clearCookie("stu_user_role");
                res.clearCookie("stu_user_role_label");
                var expiresInterval = new Date(Date.now() + 24 * 60 * 60 * 1000);
                res.cookie("stu_user_name", docs[0]["u_name"], {expires: expiresInterval});
                res.cookie("stu_user_id", docs[0]["u_id"], {expires: expiresInterval});
                res.cookie("stu_user_role", role, {expires: expiresInterval});
                res.cookie("stu_user_role_label", roleStr, {expires: expiresInterval});
                res.redirect(goWhere);
            } else {
                console.log("User bad!!!");
                res.redirect('/');

            }
            db.close();
        });
    });
});

/* 普通用户首页. */
router.get('/user', function (req, res, next) {
    res.render('user', {title: '学生会管理系统'});
});

/* 管理员用户首页. */
router.get('/admin', function (req, res, next) {
    res.render('admin', {title: '学生会管理系统'});
});


/* 新增帖子. */
router.all('/doAddPost', function (req, res, next) {
    MongoClient.connect(url, function (err, db) {
        var ds = req.body;
        console.log("Connected correctly to server.");
        var post = {
            p_id: guid(),
            p_title: ds.p_title,
            p_desc: ds.p_desc,
            p_creator_id: ds.p_creator_id,
            p_creator: ds.p_creator,
            p_date: new Date(),
            p_click_count: 0,
            p_comment_count: 0,
            p_type: "normal"
        };
        db.collection("tb_posts").insertOne(post, function (err) {
            console.log("Insert one post!!");
            db.close();
            if (err) res.json({ok: "0", msg: 'error happens ' + err});
            res.json({ok: "1", msg: 'ok'});
        });
    });
});

/* 获取帖子列表. */
router.get('/doQueryPosts', function (req, res, next) {
    MongoClient.connect(url, function (err, db) {
        console.log("Connected correctly to server.");
        var cursor = db.collection("tb_posts").find();
        cursor.toArray(function (err, docs) {
            if (err) throw err;
            var postDataArr;
            if (docs.length > 0) {
                postDataArr = docs;
                db.close();
            } else {
                postDataArr = [];
            }
            res.json({ok: "1", msg: 'ok', count: postDataArr.length, data: postDataArr});
        });
    });

});
/* 获取帖子明细. */
router.get('/doPostDetail', function (req, res, next) {
    console.log("req==" + req.query.p_id);
    MongoClient.connect(url, function (err, db) {
        console.log("Connected correctly to server.");
        var cursor = db.collection("tb_posts").find({p_id: req.query.p_id});
        cursor.toArray(function (err, docs) {
            if (err) throw err;
            if (docs.length > 0) {
                var cursor2 = db.collection("tb_comments").find({p_id: req.query.p_id});
                cursor2.toArray(function (err2, docs2) {
                    res.json({
                        ok: "1",
                        msg: 'ok',
                        p_count: docs.length,
                        p_data: docs,
                        c_count: docs2.length,
                        c_data: docs2
                    });
                    //res.render("post_details", {
                    //    title: '学生会管理系统',
                    //    ok: "1",
                    //    msg: 'ok',
                    //    p_count: docs.length,
                    //    p_data: docs,
                    //    c_count: docs2.length,
                    //    c_data: docs2
                    //});
                    db.close();
                });
            } else {
                res.json({
                    ok: "1",
                    msg: 'ok',
                    p_count: 0,
                    p_data: [],
                    c_count: 0,
                    c_data: []
                });
                //res.render("post_details", {
                //    title: '学生会管理系统',
                //    ok: "1",
                //    msg: 'ok',
                //    p_count: 0,
                //    p_data: [],
                //    c_count: 0,
                //    c_data: []
                //});
                db.close();
            }

        });
    });
});
/* 新增回复. */
router.all('/doAddComment', function (req, res, next) {
    MongoClient.connect(url, function (err, db) {
        var ds = req.body;
        console.log("Connected correctly to server.");
        var comment = {
            c_id: guid(),
            p_id: ds.p_id,
            c_content: ds.c_content,
            c_creator_id: ds.c_creator_id,
            c_creator: ds.c_creator,
            c_date: new Date()
        };
        db.collection("tb_comments").insertOne(comment, function (err) {
            console.log("Insert one comment!!");
            if (err) throw err;
            //更新post的回复数
            var col = db.collection("tb_posts");
            var cursor = col.find({p_id: ds.p_id});
            cursor.toArray(function (err, docs) {
                if (err) throw err;
                var comment_count = docs[0]["p_comment_count"];
                col.updateOne({p_id: ds.p_id}, {$set: {p_comment_count: comment_count + 1}})
                db.close();
                res.json({ok: 1});
                //res.redirect("/doPostDetail?p_id=" + ds.ipt_p_id);
            });
        });
    });
});

/* 删除帖子. */
router.get('/doDelPost', function (req, res, next) {
    console.log("req==" + req.query.p_id);
    var pID = req.query.p_id;
    MongoClient.connect(url, function (err, db) {
        var filter = {p_id: pID};
        db.collection("tb_posts").deleteMany(filter, function (err, result) {
            if (err) throw err;
            console.log("post del " + result);
            db.collection("tb_comments").deleteMany(filter, function (err2, result2) {
                if (err2) throw err2;
                console.log("comment del " + result2);
                db.close();
                res.json({ok: 1});
            });
        });
    });
});

/* 注册用户. */
router.get('/register', function (req, res, next) {
    res.render('register', {title: '学生会管理系统'});
});

/* 新增用户. */
router.all('/doAddUser', function (req, res, next) {
    MongoClient.connect(url, function (err, db) {
        var ds = req.body;
        console.log("Connected correctly to server.");
        var user = {
            u_id: guid(),
            u_name: ds.ipt_u_name,
            u_nickname: ds.ipt_u_nickname,
            u_gender: ds.ipt_u_gender,
            u_pwd: ds.ipt_u_pwd,
            u_role: "user",
            u_mail: ds.ipt_u_mail,
            u_level: 0
        };
        db.collection("tb_user").insertOne(user, function () {
            console.log("Insert one user!!");
            db.close();
            res.redirect('/');
        });
    });

});

/* 获取用户列表. */
router.get('/doQueryUsers', function (req, res, next) {
    MongoClient.connect(url, function (err, db) {
        console.log("Connected correctly to server.");
        var cursor = db.collection("tb_user").find();
        cursor.toArray(function (err, docs) {
            if (err) throw err;
            var userDataArr;
            if (docs.length > 0) {
                userDataArr = docs;
                db.close();
            } else {
                userDataArr = [];
            }
            res.json({ok: "1", msg: 'ok', count: userDataArr.length, data: userDataArr});
        });
    });
});

/* 删除用户. */
router.get('/doDelUser', function (req, res, next) {
    console.log("req==" + req.query.u_id);
    var uID = req.query.u_id;
    MongoClient.connect(url, function (err, db) {
        var filter = {u_id: uID};
        db.collection("tb_user").deleteMany(filter, function (err, result) {
            if (err) throw err;
            console.log("user del " + result);
            res.json({ok: 1});
        });
    });
});
module.exports = router;
