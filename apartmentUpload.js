require("dotenv").config()
const {MongoClient}=require("mongodb");
const csv=require("csv-parser")
const fs=require("fs")

const client=new MongoClient(process.env.P247_URI);
const model=client.db("model");

const collection=model.collection("properties")

const rows=[]
async function test(filename) {
	fs.createReadStream(`./uploads/${filename}`).pipe(csv()).on("data",async function({projectName,sectorNumber,category,state,city,...sizes}) {
		const temp=[]
		for(let size in sizes) {
			if(sizes[size]!==""&&sizes[size]!==" ") temp.push(sizes[size])
		}
		rows.push({
			projectName,sectorNumber,category,state,city,
			sizes: {
				[sectorNumber]: temp
			}
		})
	}).on("end",async function() {
		console.log(JSON.stringify(rows,null,2))
		const deleteResponse=await collection.deleteMany({category: "apartment"})
		console.log(deleteResponse)
		const response=await collection.insertMany(rows)
		console.log(response)
		process.exit()
	}).on("error",(error) => console.error(error))
}

exports.aptUpload = (req,res) => {
	test(req.file.filename);
	res.json({"success" : "apartments data uploaded"})
}

