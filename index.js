const express=require("express");
const app=express();
const multer=require("multer");
const path=require("path");
const cors=require("cors");
require("dotenv/config");
app.use(cors());
app.use(express.json());

const controllers=require("./controllers");
const propController=require("./plotController");
const userUploader=require("./userUpload");
const aptUploader = require("./apartmentUpload");
const mapUploader = require("./mapInfoUpload");
const sectorMapLoader = require("./sectorMapUpload");

const fileStorageEngine=multer.diskStorage({
	destination: (req,file,cb) => {
		cb(null,'./uploads')
	},
	filename: (req,file,cb) => {
		cb(null,file.originalname);
	},
});

const upload=multer({storage: fileStorageEngine});

app.post("/api/add-data",upload.single('file'),controllers.addData);
app.put("/api/update-data",upload.single('file'),controllers.updateData);
app.delete("/api/delete-data",upload.single('file'),controllers.deleteData);
app.put("/api/update-properties",upload.single('file'),propController.updateProp)
app.post("/api/upload-users",upload.single('file'),userUploader.uploadUsers);
app.put("/api/upload-apt",upload.single('file') , aptUploader.aptUpload);
app.put("/api/map-info", upload.single('file') , mapUploader.updateMap);
app.post("/api/sector-map", upload.single('file') , sectorMapLoader.uploadSectorMaps );

// app.get("/download-sample",controllers.downloadSample );

app.listen(3000||process.env.PORT,err => {
	if(err)
		throw err
	console.log('Server started!')
})
