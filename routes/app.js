var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
const https = require('https');


var db=mongoose.connection;
 



function generateOtp(n) {
    var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

    if ( n > max ) {
            return generate(max) + generate(n - max);
    }

    max        = Math.pow(10, n+add);
    var min    = max/10; // Math.pow(10, n) basically
    var number = Math.floor( Math.random() * (max - min + 1) ) + min;

    return ("" + number).substring(add); 
}


var otp;




router.post('/registerCheck',  function(req,res,next){

    otp=generateOtp(6);

    db.collection('users').find({"email":req.body.email}).toArray( (err,mail) => {
      if(err)
          res.status(402).json({"code":402,"status":"error"});
      else{
          if(mail.length!=0){
              res.status(200).json({"code":202,"status":"User mail-id already exists"});
          }
          else{
                db.collection('userSample').find({"email":req.body.email}).toArray( (err,check) => {
                  if(err)
                      res.status(402).json({"code":402,"status":"error"});
                  else{
                      if(check.length!=0){
                        db.collection('userSample').findOneAndUpdate(
                          {email:req.body.email},
                          {"$set": {"otp": otp}},
                          [['_id','asc']], 
                          {"upsert":false} // options
                          // function(err, object) {
                          //     if (err){
                          //         console.log(err);  // returns error if no matching object found
                          //         res.status(402).json({"code":402,"status":"error"});
                          //     }else{
                        );
                                var transporter = nodemailer.createTransport({
                                  service : 'gmail',
                                  auth: {
                                        user: 'googlkeep8@gmail.com',
                                        pass: 'q1w2e3r4t5@'
                                    }
                                });
                                
                                
                                const mailOptions = {
                                  from: 'googlkeep8.com', // sender address
                                  to: req.body.email, // list of receivers
                                  subject: 'OTP for Registration', // Subject line
                                  html: "<h3>Hi,Welcome to google Family </h3><br><p>Your OTP for registration is "+otp+"</p>"
                                
                                }
                                transporter.sendMail(mailOptions, function (err, info) {
                                  if(err)
                                    res.status(402).json({"code":402,"status":"error"});
                                  else
                                    res.status(200).json({"code":200,"status":"otp again generated"});
                              });
                        
                              // }
                          // });
                        
                      }
                      else{
                              db.collection('userSample').insertOne({
                                email:req.body.email,
                                otp:otp
                              })
                              var transporter = nodemailer.createTransport({
                                service : 'gmail',
                                auth: {
                                      user: 'googlkeep8@gmail.com',
                                      pass: 'q1w2e3r4t5@'
                                  }
                              });
                              
                              
                              const mailOptions = {
                                from: 'googlkeep8.com', // sender address
                                to: req.body.email, // list of receivers
                                subject: 'Otp for Registration', // Subject line
                                html: "<h3>Hi,Welcome to Amuda Family </h3><br><p>Your Otp for registration is "+otp+"</p>"
                              
                              }
                              transporter.sendMail(mailOptions, function (err, info) {
                                if(err)
                                  res.status(402).json({"code":402,"status":"error"});
                                else
                                  res.status(200).json({"code":200,"status":"otp generated"});
                            });
                          }
                     } 
        }) 
      }
    } 
  })
})




router.post('/register',  function(req,res,next){

    db.collection('userSample').find({"otp":req.body.otp}).toArray( (err,sample) => {
      if(err)
      res.status(402).json({"code":402,"status":"error"});
      else{
          if(sample.length!=0){
              sample.forEach((x)=>{
                    db.collection('userSample').deleteMany({"otp":req.body.otp},function(err,views){
                      if(err)
                        console.log(err);
                      else
                      {
                        db.collection('users').insertOne({
                          email:x.email,
                          name:req.body.name,
                          accesscode:req.body.accesscode,
                          tou:req.body.tou,
                          msgid: "",
                          uuid:"",
                          type:""
                        });
                        
                        var transporter = nodemailer.createTransport({
                          service : 'gmail',
                          auth: {
                                user: 'googlkeep8@gmail.com',
                                pass: 'q1w2e3r4t5@'
                            }
                        });
                        
                        
                        const mailOptions = {
                          from: 'googlkeep8.com', // sender address
                          to: x.email, // list of receivers
                          subject: 'Registration Successful', // Subject line
                          html: "<h3>Hi "+req.body.name+",Welcome to Amuda Family</h3><br><p>All the best for your project.</p>"                        
                        }
                        transporter.sendMail(mailOptions, function (err, info) {
                          if(err)
                            res.status(402).json({"code":402,"status":"error"});
                          else
                            res.status(200).json({"code":200,"status":"Registered Successfully"});
                        });
                      }
                      
                    })
                    
                })
            }
            else{
              res.status(207).json({"code":207,"status":"details incorrect"});
            }
          }
    })
})





router.post('/login', function(req,res,next){
  db.collection('users').find({email:req.body.email}).toArray( (err,mail) => {
    if(err)
        res.status(402).json({"code":402,"status":"error"});
    else{
    if(mail.length!=0) {
      mail.forEach((x)=>{
        if(x.accesscode==req.body.accesscode){
          // generate token
          let token = jwt.sign({email:x.email},'secret');
          
          
          
          db.collection('users').findOneAndUpdate(
            {email:x.email},
            {"$set": {"msgid": req.body.appID}},
            [['_id','asc']],  // sort order
            {"upsert":false}, // options
            );

          return res.status(200).json({'code':200,'token':token});

        } else {
          return res.status(200).send({'code':411,'token':""});
        }
      })
    }
    else {
      return res.status(200).json({'code':400,'message':'User email is not registered.'})
    }
  }
  })
})









router.post('/logout',function(req,res){

  let token = req.body.token;
  let dt=""
    jwt.verify(token,'secret', function(err, tokendata){
      if(err){
         res.status(200).json({"code":402,"message":"Unauthorized request"});
      }
      if(tokendata){
        dt = tokendata;
        db.collection('users').find({"email":dt.email}).toArray( (err,mail) => {
          if(err)
              res.status(200).json({"code":402,"status":"error"});
          else{
              if(mail.length!=0){
                var newmsgid="";
                  // mail.forEach((x)=>{
                  //     var temp=x.msgid;
                  //     var arr=temp.split("@");
                  //     for(var d=0;d<arr.length;d++){
                  //       if(arr[d]!=req.body.appID){
                  //         if(newmsgid.length==0){
                  //           newmsgid+=arr[d];
                  //         }
                  //         else{
                  //           newmsgid+="@";
                  //           newmsgid+=arr[d];
                  //         }
                          
                  //       }
                  //     }
                  //     if(newmsgid==null){
                  //       newmsgid="";
                  //     }

                  //   })
                    db.collection('users').findOneAndUpdate(
                      {email:dt.email},
                      {"$set": {"msgid": ""}},
                      [['_id','asc']],  // sort order
                      {"upsert":false}, // options
                      );
                      res.status(200).json({"code":200,"message":"logout succesful"})
                  }
                }
              });
            }
          })       
    })










router.post('/user', function(req,res,next){
  return verifyToken(req,res);
})

var decodedToken='';
function verifyToken(req,res){
  let token = req.body.token;

  jwt.verify(token,'secret', function(err, tokendata){
    if(err){
      return res.status(200).json({"code":402,"message":"Unauthorized request"});
    }
    if(tokendata){
      decodedToken = tokendata;
      db.collection('users').find({"email":decodedToken.email}).toArray( (err,mail) => {
        if(err)
            res.status(200).json({"code":402,"status":"error"});
        else{
            if(mail.length!=0){
              mail.forEach((x)=>{
                res.status(200).json({"code":200,"email":x.email,"name":x.name,"tou":x.tou});
              });
            }
            else{
                res.status(200).json({"code":400,"status":"User does not exists"});
            }

        }        
      })
    }
  })
}







router.post('/passwordCheck',  function(req,res,next){

  otp=generateOtp(6);

  db.collection('users').find({"email":req.body.email}).toArray( (err,mail) => {
    if(err)
        res.status(402).json({"code":402,"status":"error"});
    else{
        if(mail.length==0){
            res.status(200).json({"code":202,"status":"User does not exists"});
        }
        else{
              db.collection('passwordSample').find({"email":req.body.email}).toArray( (err,check) => {
                if(err)
                    res.status(402).json({"code":402,"status":"error"});
                else{
                    if(check.length!=0){
                      db.collection('passwordSample').findOneAndUpdate(
                        {email:req.body.email},
                        {"$set": {"otp": otp}},
                        [['_id','asc']], 
                        {"upsert":false} 
                      );
                              var transporter = nodemailer.createTransport({
                                service : 'gmail',
                                auth: {
                                      user: 'googlkeep8@gmail.com',
                                      pass: 'q1w2e3r4t5@'
                                  }
                              });
                              
                              
                              const mailOptions = {
                                from: 'googlkeep8.com', // sender address
                                to: req.body.email, // list of receivers
                                subject: 'OTP for Change Password', // Subject line
                                html: "<h3>Hi ,</h3><br><p>Your OTP for change password is "+otp+"</p>"
                              
                              }
                              transporter.sendMail(mailOptions, function (err, info) {
                                if(err)
                                  res.status(200).json({"code":402,"status":"error"});
                                else
                                  res.status(200).json({"code":200,"status":"otp again generated"});
                            });
                      
                            // }
                        // });
                      
                    }
                    else{
                            db.collection('passwordSample').insertOne({
                              email:req.body.email,
                              otp:otp
                            })
                            var transporter = nodemailer.createTransport({
                              service : 'gmail',
                              auth: {
                                    user: 'googlkeep8@gmail.com',
                                    pass: 'q1w2e3r4t5@'
                                }
                            });
                            
                            
                            const mailOptions = {
                              from: 'googlkeep8.com', // sender address
                              to: req.body.email, // list of receivers
                              subject: 'OTP for Change Password', // Subject line
                              html: "<h3>Hi ,</h3><br><p>OTP for Change Password is "+otp+"</p>"
                            
                            }
                            transporter.sendMail(mailOptions, function (err, info) {
                              if(err)
                                res.status(200).json({"code":402,"status":"error"});
                              else
                                res.status(200).json({"code":200,"status":"otp generated"});
                          });
                        }
                   } 
      }) 
    }
  } 
})
})
 















router.post('/updatePassword',function(req,res){

    db.collection('passwordSample').find({"otp":req.body.otp}).toArray( (err,sample) => {
      if(err)
      res.status(402).json({"code":402,"status":"error"});
      else{
          if(sample.length!=0){
              sample.forEach((x)=>{
                    db.collection('passwordSample').deleteMany({"otp":req.body.otp},function(err,views){
                      if(err)
                        console.log(err);
                      else
                      {
                        db.collection('users').findOneAndUpdate(
                          {email:x.email},
                          {"$set": {"accesscode": req.body.accesscode}},
                          [['_id','asc']],  // sort order
                          {"upsert":false}, // options
                          );
                        
                        var transporter = nodemailer.createTransport({
                          service : 'gmail',
                          auth: {
                                user: 'googlkeep8@gmail.com',
                                pass: 'q1w2e3r4t5@'
                            }
                        });
                        
                        
                        const mailOptions = {
                          from: 'googlkeep8.com', // sender address
                          to: x.email, // list of receivers
                          subject: 'Change Password Successful', // Subject line
                          html: "<h3>Hi Your account password for "+x.email+" has been changed successfully</h3><br>"                        
                        }
                        transporter.sendMail(mailOptions, function (err, info) {
                          if(err)
                            res.status(402).json({"code":402,"status":"error"});
                          else
                            res.status(200).json({"code":200,"status":"Password Changed Successfully"});
                        });
                      }
                      
                    })
                    
                })
            }
            else{
              res.status(207).json({"code":207,"status":"details incorrect"});
            }
          }
    })

  
})








module.exports = router;
