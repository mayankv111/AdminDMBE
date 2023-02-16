require("dotenv").config()
const {MongoClient,ObjectId}=require("mongodb");
const csv=require("csv-parser")
const fs=require("fs");

const client=new MongoClient(process.env.P247_URI);
const model=client.db("model");

const collection1=model.collection("properties");
const collection2=model.collection("authority");

let c=0;
const rows=[]
async function findAndUpdateProperty(plotNo,sectorNo,oname,mobile) {
	let res = await collection1.findOne({});
	let res0=await collection1.findOne({
		category: "PLOT",
		plotNumber: plotNo.toUpperCase(),
		sectorNumber: sectorNo.toUpperCase()
	});
	if(sectorNo==="South City 1") {
		res=await collection1.findOne({plotNumber: plotNo,sectorNumber: "SC-1",category: "PLOT"});
	}
	else if(sectorNo==="South City 2") {
		res=await collection1.findOne({plotNumber: plotNo,sectorNumber: "SC-2",category: "PLOT"});
	}
	else {
		res=await collection1.findOne({plotNumber: plotNo,sectorNumber: sectorNo,category: "PLOT"});
	}
	console.log("res : ",res,"res0 : " ,res0);
	if(res==null && res0 == null) {
		let res1=await collection1.insertOne({
			category: "PLOT",
			plotNumber: plotNo.toUpperCase(),
			sectorNumber: sectorNo.toUpperCase()
		})
		// console.log(res1);
		await updatePropertyAuth(res1.insertedId,oname,mobile);
	}

	if(res && res0 === null){
		let resupdate=await collection1.updateOne({
			_id : ObjectId(res._id)
		},{
			$set: {
				plotNumber: plotNo.toUpperCase(),
				sectorNumber: sectorNo.toUpperCase(),
			}
		})
		await updatePropertyAuth(res._id,oname,mobile);
	}

	if(res0 && res == null){
		// console.log(1);
		await updatePropertyAuth(res0._id,oname,mobile);
	}

	if(res && res0)
	{
		await collection1.updateOne({
			_id : ObjectId(res._id)
		},{
			$set: {
				plotNumber: plotNo.toUpperCase(),
				sectorNumber: sectorNo.toUpperCase(),
			}
		})
		await updatePropertyAuth(res._id, oname, mobile);
	}
}

async function updatePropertyAuth(propid,oname,mobile) {
	let res=await collection2.findOne({propertyID: ObjectId(propid)});
	// console.log(res, oname, mobile);
	c++;
	console.log(c);
	if(res==null) {
		await collection2.insertOne({
			ownerName: oname,
			owenerFather: "",
			address: "",
			phoneNumber: mobile,
			propertyID: ObjectId(propid),
		});
	}
	else {
		if(oname && mobile){
			await collection2.updateOne(
			{ _id : ObjectId(res._id) , },
			{
				$set: {
					ownerName: oname,
					phoneNumber: mobile,
				}
			});
		}
		else if(oname && !mobile)
		{
			await collection2.updateOne(
				{ _id : ObjectId(res._id) },
				{
					$set: {
						ownerName: oname,
					}
				});
		}
		else if(!oname && mobile)
		{
			await collection2.updateOne(
				{ _id : ObjectId(res._id) },
				{
					$set: {
						phoneNumber : mobile,
					}
				});
		}

	}
}

async function test(filename) {
	fs.createReadStream(`./uploads/${filename}`).pipe(csv()).on("data",async function(row) {
		rows.push(row)
	}).on("end",async function() {
		for(let i=0;i< rows.length;i++) {
			await findAndUpdateProperty(rows[i].Plot_Number,rows[i].Sector,rows[i].OWNER_NAME,rows[i].MOBILE);
		process.exit()
		}
	}).on("error",(error) => console.error(error))
}

// exports.updateProp = (req,res) =>{
// 	test(req.file.filename);
// 	res.json({ "success" : "data updated"});
// }

test("merge.csv");

