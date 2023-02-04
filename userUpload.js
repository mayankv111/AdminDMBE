require("dotenv").config()
const {MongoClient,ObjectId}=require("mongodb");
const csv=require("csv-parser")
// const bcrypt = require("bcryptjs");
const fs=require("fs");

const client=new MongoClient(process.env.P247_URI);
const model=client.db("model");

const collection=model.collection("users");

const rows=[]

async function addAndRegisterUsers(email,name,phone,role,CompanyName) {
	let res=await collection.findOne({email: email.toLowerCase()});
	if(res) {
		const result=await collection.updateOne({email: email.toLowerCase()},
			{
				$set: {
					name: name,
					phoneNumber: phone,
					companyName: CompanyName
				}
			})
	}
	if(res===null) {
		const data={
			name: name,
			email: email.toLowerCase(),
			phoneNumber: phone,
			companyName: CompanyName,
		}

		fetch("https://testp247apis.nextsolutions.in/auth/microservice/register",{
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then((res) =>  console.log(res))
			.catch((err) => console.log(err))
	}
}
async function test(filename) {
	fs.createReadStream(`./uploads/${filename}`).pipe(csv()).on("data",async function(row) {
		rows.push(row)
	}).on("end",async function() {
		for(let i=0;i<rows.length;i++) {
			await addAndRegisterUsers(rows[i].Emailid,rows[i].Name,rows[i].Phone,rows[i].Role,rows[i].CompanyName);
		}
		process.exit()
	}).on("error",(error) => console.error(error))
}

// const result = await collection.insertOne({
//   password: "$2a$10$N73cqJWEyU.PbYgcQHw45eDE3rmE/N6e15VweqhVZJcjn6emh1L8y",
//   role: "propertyDealer",
//   name:name,
//   email: email.toLowerCase(),
//   phoneNumber:phone,
//   companyName:CompanyName,
//   active: true,
// });
// if(result===null) console.log(email.toLowerCase());

exports.uploadUsers=(req,res) => {
	// test(req.file.filename);
	res.send({"success": "users uploaded"})
}