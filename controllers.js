const fs=require("fs");
require('dotenv/config');
const {MongoClient,ObjectId}=require("mongodb");
const csv=require("csv-parser")
const client=new MongoClient(process.env.P247_URI);
const model=client.db("model");
// const collection=model.collection("properties");

const rows=[]
async function updateDataUtil(id,updates, collection) {
	const { _id, ...obj} = updates;
	const collect=model.collection(collection)
	let res=await collect.updateOne({_id: ObjectId(id)},{
		$set: obj
	});
}

async function addDataUtil(data,collection) {
	const collect=model.collection(collection)
	let res=await collect.insertOne({data});
}

async function deleteDataUtil(id,collection) {
	const collect=model.collection(collection)
	let res=await collect.deleteOne({_id: ObjectId(id)});
}

async function test(filename, action, collection) {
	fs.createReadStream(`./uploads/${filename}`).pipe(csv()).on("data",async function(row) {
		rows.push(row)
	}).on("end",async function() {
			for(let i=0;i<rows.length;i++) {
				if(action ==="update")
					await updateDataUtil(rows[i]._id, rows[i], collection);
				if(action ==="add")
					await addDataUtil(rows[i], collection);
				if(action === "delete")
					await deleteDataUtil(rows[i]._id, collection);
			}
	}).on("error",(error) => console.error(error))
}

exports.addData=function(req,res) {
	test(req.file.filename, "add", req.body.object);
	res.json({"success" : "data added" })
}
exports.updateData=function(req,res) {
	test(req.file.filename, "update" ,req.body.object);
	res.json({"success": "data updated"})
}
exports.deleteData=function(req,res) {
	test(req.file.filename, "delete",  req.body.object);
	res.json({"success" : "data deleted" })
}

// exports.getActions=function(req,res) {
// 	// if(req.body.application === "P247")
// 	// {
// 	// client=new MongoClient(process.env.P247_URI);
// 	// model=client.db("model");
// 	// }
// 	const actions=["ADD","UPDATE","DELETE"];
// 	res.send({actions});
// }

exports.getObjects=function(req,res) {
	let objects=[];
	// if(req.body.application==="p247") {
		objects=[
			'searches',
			'tags',
			'maps',
			'leads',
			'authority',
			'flat-authority',
			'fieldPermissions',
			'properties',
			'masterManagement',
			'aparmtentsAuthority',
			'sectorMaps',
			'flat-leads',
			'users',
			'flats',
			'leads2'
		]
	// }

	res.json({objects});
}

// exports.setCollection = function(req,res){
// 	const collection = model.collection(req.body.collection);
// }

exports.downloadSample=function(req,res) {
	console.log(req.body);
	const file=fs.createReadStream(`./samples/sample-${req.body.object}.csv`); 
	
	res.pipe(file);
}

