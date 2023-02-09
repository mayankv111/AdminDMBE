require("dotenv").config()
const {MongoClient,ObjectId}=require("mongodb");
const csv=require("csv-parser")
const fs=require("fs");

const client=new MongoClient(process.env.P247_URI);
const model=client.db("model");

const collection1=model.collection("properties");
const collection2 = model.collection("authority");
// const collection3 = model.collection("temp_missingProperties");
let c = 0;
const rows=[]
async function findAndUpdateProperty(plotNo , sectorNo , oname, mobile, category){
	let res = await collection1.findOne({ plotNumber : plotNo , sectorNumber : sectorNo , category : "PLOT"});
	if(res == null) {
		let resmiss = await collection1.insertOne({
			plotNumber : plotNo , 
			sectorNumber : sectorNo,
			category : "PLOT"
		})
		console.log(resmiss);
		await updatePropertyAuth(resmiss._id , oname, mobile);
	}
	else{
	await updatePropertyAuth(res._id , oname, mobile);
	}
}

async function updatePropertyAuth(propid, oname, mobile) {
	let res = await collection2.findOne({propertyID: ObjectId(propid)});
	c++;
	console.log(c);
	if(res === null)
	{
		console.log("at not fond", mobile);
		let res1 =await collection2.insertOne({
			ownerName : oname , 
			owenerFather : null,
			address : "",
			phoneNumber : mobile , 
			propertyID: ObjectId(propid), 
			});
		console.log(res1);
	}
	else {
		console.log(res.ownerName);
		if(res.ownerName !== "" || res.phoneNumber !== "")
		{
		 	let res2 = await collection2.updateOne(
		 	{propertyID: ObjectId(propid)},
		 	{ $set :{
		 		ownerName : oname , 
		 		phoneNumber : mobile ,  
		 		}
		 	});
		 	console.log(res2);
		 }
	}
}

async function test(filename) {
	fs.createReadStream(`./uploads/${filename}`).pipe(csv()).on("data",async function(row) {
		rows.push(row)
	}).on("end",async function() {
		for(let i=0;i<rows.length;i++) {
			await findAndUpdateProperty(rows[i].Plot_Number, rows[i].Sector,rows[i].OWNER_NAME,rows[i].MOBILE,rows[i].Category);
		}
		process.exit()
	}).on("error",(error) => console.error(error))
}

exports.updateProp = (req,res) =>{
	test(req.file.filename);
	res.json({ "success" : "data updated"});
}

