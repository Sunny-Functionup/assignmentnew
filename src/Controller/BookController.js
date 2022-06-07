const bookModel = require("../Model/bookModel")
const BookModel = require("../Model/bookModel")
const UserModel = require("../Model/userModel")

//Creating a validation function
const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null) { return false }
    if (typeof (value) === "string" && (value).trim().length > 0) { return true }
}


//=============================================================================================================================================//

//Third API function(for creating a book document)
const createBook = async (req, res) => {
    try {
        //Checking if no data is present in request body
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "Please provide some data to create a book document" })
        }

        //Checking if user has entered these mandatory fields or not
        const { title, userId, category, releasedAt} = data

        if (!isValid(title)) {
             return res.status(400).send({ status: false, message: "title is required" })
             }

        //Checking if title already exists (i.e. title is not unique)
        let uniqueTitle = await BookModel.findOne({title : data.title})
        if (uniqueTitle) {
          return res.status(400).send({status: false , message: "title already exists"})
             }
          
       
        if (!isValid(userId)) { 
            return res.status(400).send({ status: false, message: "userId is required" })
         }

        //Checking if User Id is a valid type Object Id or not
        let UserId = data.userId
        let validateUserId = function (UserId) {
            return /^[a-f\d]{24}$/.test(UserId)
        }
        if (!validateUserId(UserId)){
        return res.status(400).send({status: false , message: `${UserId} is not valid type user Id`})
        }

        //Checking if user with this id exists in our collection or not
        let userExist=await UserModel.findOne({_id:UserId}).select({role:1,_id:0})
         if (!userExist) {
            return res.status(400).send({status: false , message: "No such user exists with this id and role"})
        }
        let Role=userExist.role;
        let validRole= function(value){
            for(let i=0;i<value.length;i++){
                if((value[i]=="CREATOR")||((value[i]=="CREATOR")&&((value[i]="VIEWER")||(value[i]=="VIEW_ALL")))) return true;
            }
            return false;
        }
        if (!validRole(Role)) {
            return res.status(400).send({status: false , message: "No such user exists with this  role"})
        }

       

        if (!isValid(category)) { 
            return res.status(400).send({ status: false, message: "category is required" })
         }

        //Subcategory is array of string so we can not check validation of it by *isValid* function

         if (!isValid(releasedAt)) { 
            return res.status(400).send({ status: false, message: "releasedAt is required" })
         }
        
        //Checking if that releasedAt is a valid date and in valid format or not
         let ReleasedAt = data.releasedAt
        let validateReleasedAt = function (ReleasedAt) {
            return /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(ReleasedAt)
        }
        if (!validateReleasedAt(ReleasedAt)){
        return res.status(400).send({status: false , message: "Please enter valid date in a valid format i.e. YYYY-MM-DD"})
        }

       //If all the validations passed , send a successfull response
        let bookData = await BookModel.create(data)
        return res.status(201).send({status: true , message: "Your book is successfully created", data: bookData })
    }

    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}

//===================================================================================================//
const viewYourBooks = async (req , res) => {
    try {
        const user_Id=req.params.userId
        const filterQuery = {isDeleted: false , deletedAt: null}
        
        let validateUserId = function (UserId) {
            return /^[a-f\d]{24}$/.test(UserId)
        }
        if (isValid(user_Id) && validateUserId(user_Id)) {
            filterQuery['userId'] = user_Id
            }
            
            let userExist=await UserModel.findOne({_id:user_Id}).select({role:1,_id:0})
            if (!userExist) {
               return res.status(400).send({status: false , message: "No such user exists with this id and role"})
           }
           let Role=userExist.role;
           let validRole= function(value){
               for(let i=0;i<value.length;i++){
                   if(((value[i]=="CREATOR")&& (value[i]=="VIEWER"))||((value[i]=="CREATOR")&& (value[i]=="VIEWER") && (value[i]=="VIEW_ALL"))) return true;
               }
               return false;
           }
           if (!validRole(Role)) {
               return res.status(403).send({status: false , message: "You can not do this task"})
           }

           let queryBody=req.query.body
         const{neW,old}=query;
        if(queryBody){
            const time=Date.now()-10*60*60
          if(neW) { 
              let bookTime= await BookModel.find({createdAt:{$lt:time}})
            if(!bookTime){
                res.status(404).send("No book created within 10 minutes")
            }
            return res.status(200).send({ status: true, message: "Books list" , data: bookTime });

        }
        if(old){
            let bookTimes= await BookModel.find({createdAt:{$gt:time}})
            if(!bookTimes){
                res.status(404).send("No book created before 10 minutes")
            }
            return res.status(200).send({ status: true, message: "Books list" , data: bookTimes });

        }

        }
    
        //Fetching books which have the above filters
        const books = await BookModel.find({$and : [filterQuery]})
        //If no such book found
        if (Array.isArray(books) && books.length == 0) {
            return res.status(404).send({ status: false, msg: "No books found" })
        }
        //Sending successful response (only data with above filters)
        return res.status(200).send({ status: true, message: "Books list" , data: books });

        } 
        
       
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}
//=====================================================================================================//
const viewAllBooks = async (req , res) => {
    try {
        const user_Id=req.params.userId
        const filterQuery = {isDeleted: false , deletedAt: null}
        
        let validateUserId = function (UserId) {
            return /^[a-f\d]{24}$/.test(UserId)
        }
        if (!validateUserId(user_Id)){
            return res.status(400).send({status: false , message: `${user_Id} is not valid type user Id`})
            }

            let userExist=await UserModel.findOne({_id:user_Id}).select({role:1,_id:0})
            if (!userExist) {
               return res.status(400).send({status: false , message: "No such user exists with this id and role"})
           }
           let Role=userExist.role;
           let validRole= function(value){
               for(let i=0;i<value.length;i++){
                   if(((value[i]=="CREATOR")&& (value[i]=="VIEW_ALL"))||((value[i]=="VIEW_ALL"))||((value[i]=="CREATOR")&& (value[i]=="VIEWER") && (value[i]=="VIEW_ALL"))||((value[i]=="VIEWER")&&(value[i]=="VIEW_ALL"))) return true;
               }
               return false;
           }
           if (!validRole(Role)) {
               return res.status(403).send({status: false , message: "You can not do this task"})
           }
        let queryBody=req.query.body
         const{neW,old}=query;
        if(queryBody){
            const time=Date.now()-10*60*60
          if(neW) { 
              let bookTime= await BookModel.find({createdAt:{$lt:time}})
            if(!bookTime){
                res.status(404).send("No book created within 10 minutes")
            }
            return res.status(200).send({ status: true, message: "Books list" , data: bookTime });

        }
        if(old){
            let bookTimes= await BookModel.find({createdAt:{$gt:time}})
            if(!bookTimes){
                res.status(404).send("No book created before 10 minutes")
            }
            return res.status(200).send({ status: true, message: "Books list" , data: bookTimes });

        }

        }
        else{
            //Fetching books which have the above filters
        const books = await BookModel.find({$and : [filterQuery]})
        //If no such book found
        if (Array.isArray(books) && books.length == 0) {
            return res.status(404).send({ status: false, msg: "No books found" })
        }
        //Sending successful response (only data with above filters)
        return res.status(200).send({ status: true, message: "Books list" , data: books });
        }
        } 
        
       
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}


module.exports.createBook=createBook;
module.exports.viewYourBooks=viewAllBooks;
module.exports.viewAllBooks=viewAllBooks;