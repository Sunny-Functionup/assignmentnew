const express=require('express')
const bodyParser=require('body-parser')
const route=require('./route/route.js')
const morgan=require('morgan')
const {default:mongoose}=require('mongoose')
const app=express();


app.use(bodyParser.json());
app.use(morgan('tiny'));

mongoose.connect(process.env.MONGO_DB_CLUSTER).then(() => {
    console.log("MongoDb Connected !");
}).catch((error) => {
    console.log(error.message);
});

app.use('/',route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});