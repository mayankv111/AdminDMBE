require("dotenv").config()
const {MongoClient,ObjectId}=require("mongodb");
const csv=require("csv-parser")
const fs=require("fs");

const client=new MongoClient(process.env.P247_URI);
const model=client.db("model");

const collection1=model.collection("properties");
const collection2 = model.collection("maps");
const rows=[]
async function findAndUpdateProperty(plotNo , sectorNo ,size,	roadWidth,	parkFacing	,cornerPlot	,direction, seqNo	){
	let res = await collection1.findOne({ category :"PLOT", plotNumber : plotNo , sectorNumber : sectorNo});
	if(res === null) {
		let resmiss = await collection1.insertOne(		{
			category :"PLOT",
			plotNumber : plotNo , 
			sectorNumber : sectorNo,
			sequenceNumber : seqNo
		})
		await updatePropertyMap(resmiss.insertedId , size,	roadWidth,	parkFacing	,cornerPlot	,direction	);
	}
	else{
	await updatePropertyMap(res._id , size,	roadWidth,	parkFacing	,cornerPlot	,direction	);
	}
}

async function updatePropertyMap(propid, size,	roadWidth,	parkFacing	,cornerPlot	,direction	) {
	let res = await collection2.findOne({propertyID: ObjectId(propid)});
	if(res === null)
	{
		let res1 =await collection2.insertOne({
			size : size,
			roadWidth : roadWidth,
			parkFacing : parkFacing,
			cornerPlot : cornerPlot,
			direction : direction,
			propertyID: ObjectId(propid), 
			});
		console.log(res1);
	}
	else {
		await collection2.updateOne(
		{ _id :  res._id},
		{ $set : 
			{
			size : size,
			roadWidth : roadWidth,
			parkFacing : parkFacing,
			cornerPlot : cornerPlot,
			direction : direction,
		}	});
	}
}

async function test(filename) {
	fs.createReadStream(`./uploads/${filename}`).pipe(csv()).on("data",async function(row) {
		rows.push(row)
	}).on("end",async function() {
		for(let i=0;i<rows.length;i++) {
			await findAndUpdateProperty(rows[i].Plot_Number,rows[i].sectorNo, rows[i].size	, rows[i].roadWidth	, rows[i].parkFacing,  rows[i].cornerPlot,  rows[i].direction , rows[i].seqNo);
		}
		process.exit()
	}).on("error",(error) => console.error(error))
}

// exports.updateMap = (req,res) =>{
// 	test(req.file.filename);
// 	res.json({ "success" : "data updated"});
// }

test("");