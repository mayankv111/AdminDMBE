require("dotenv").config()
const {MongoClient,ObjectId}=require("mongodb");
const csv=require("csv-parser")
const fs=require("fs");

const client=new MongoClient(process.env.P247_URI);
const model=client.db("model");

const collection1=model.collection("properties");
const collection2 = model.collection("authority");
const collection3 = model.collection("temp_missingProperties");
const rows=[]
async function findAndUpdateProperty(plotNo , sectorNo , oname, mobile){
	let res = await collection1.findOne({ plotNumber : plotNo , sectorNumber : sectorNo});
	if(res === null) {
		let resmiss = await collection3.insertOne({
			plotNumber : plotNo , 
			sectorNumber : sectorNo,
		})
		console.log(resmiss);
	}
	else{
	await updatePropertyAuth(res._id , oname, mobile);
	}
}

async function updatePropertyAuth(propid, oname, mobile) {
	let res = await collection2.findOne({propertyID: ObjectId(propid)});
	if(res === null)
	{
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
		// if(res.ownerName !== "" && res.phoneNumber === "")
		// {
		// 	await collection2.updateOne(
		// 		{propertyID: ObjectId(propid)},
		// 		{
		// 			$set : {
		// 				ownerName : oname
		// 			}
		// 		}
		// 	)
		// }
		// else if(res.ownerName === "" && res.phoneNumber !== "")
		// {
		// 	await collection2.updateOne(
		// 		{propertyID: ObjectId(propid)},
		// 		{
		// 			$set : {
		// 				phoneNumber : mobile
		// 			}
		// 		}
		// 	)
		// }
		if(res.ownerName !== "" || res.phoneNumber !== "")
		{
			await collection2.updateOne(
			{propertyID: ObjectId(propid)},
			{ $set :{
				ownerName : oname , 
				phoneNumber : mobile ,  
				}
			});
		}
	}
}

// async function updatePropertyMaps(propid, oname, mobile) {
// 	let res = await collection2.findOne({propertyID: ObjectId(propid)});
// 	if(res === null)
// 	{
// 		let res1 =await collection2.insertOne({
// 			ownerName : oname , 
// 			owenerFather : null,
// 			address : "",
// 			phoneNumber : mobile , 
// 			propertyID: ObjectId(propid), 
// 			});
// 		console.log(res1);
// 	}
// 	else {
// 		console.log(res);
// 		if(res.ownerName !== "" && res.phoneNumber === "")
// 		{
// 			await collection2.updateOne(
// 				{propertyID: ObjectId(propid)},
// 				{
// 					$set : {
// 						ownerName : oname
// 					}
// 				}
// 			)
// 		}
// 		else if(res.ownerName === "" && res.phoneNumber !== "")
// 		{
// 			await collection2.updateOne(
// 				{propertyID: ObjectId(propid)},
// 				{
// 					$set : {
// 						phoneNumber : mobile
// 					}
// 				}
// 			)
// 		}
// 		else
// 		{
// 			await collection2.updateOne(
// 			{propertyID: ObjectId(propid)},
// 			{ $set :{
// 				ownerName : oname , 
// 				phoneNumber : mobile ,  
// 				}
// 			});
// 		}
// 	}
// 	val++;
// 	console.log(val);
// }

async function test(filename) {
	fs.createReadStream(`./uploads/${filename}`).pipe(csv()).on("data",async function(row) {
		rows.push(row)
	}).on("end",async function() {
		for(let i=0;i<rows.length;i++) {
			await findAndUpdateProperty(rows[i].Plot_Number, rows[i].Sector,rows[i].OWNER_NAME,rows[i].MOBILE);
		}
		process.exit()
	}).on("error",(error) => console.error(error))
}

exports.updateProp = (req,res) =>{
	test(req.file.filename);
	res.json({ "success" : "data updated"});
}