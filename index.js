const express = require('express')
const PORT = process.env.PORT || 5000
var usersRouter = require('./routes/app');
var app = express();


 var mongoose = require('mongoose');
 
mongoose.connect('mongodb+srv://google:wwT4h66ySy7Yfh27@cluster0-auyic.mongodb.net/googleKeep?retryWrites=true&w=majority',{useNewUrlParser: true });

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(express.json());
  
app.use('/', usersRouter);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

