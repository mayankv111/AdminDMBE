require("dotenv").config()
const {MongoClient,ObjectId}=require("mongodb");
const csv=require("csv-parser")
// const bcrypt = require("bcryptjs");
const fs=require("fs");

const client=new MongoClient(process.env.P247_URI);
const model=client.db("model");

const collection=model.collection("sectorMaps");

const rows=[]

async function addAndUpdateMaps(id, sectorNumber, mapName) {
	let res=await collection.findOne({_id: id});
	if(res) {
		const result=await collection.updateOne({email: email.toLowerCase()},
			{
				$set: {
					sectorNumber : sectorNumber,
					mapName : mapName
				}
			})
			console.log(result);
	}
	if(res===null) {
		const data={
			sectorNumber : sectorNumber,
			mapName : mapName
		}

		fetch("https://testp247apis.nextsolutions.in/uploadMap",{
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
			await addAndUpdateMaps(rows[i]._id, rows[i].sectorNumber, rows[i].mapName);
		}
		process.exit()
	}).on("error",(error) => console.error(error))
}

exports.uploadSectorMaps=(req,res) => {
	test(req.file.filename);
	res.send({"success": "maps uploaded"})
}