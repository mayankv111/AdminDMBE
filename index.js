const express=require("express");
const app=express();
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv/config");
app.use(cors());
app.use(express.json());
// app.use(express.static(path.resolve(__dirname, './client/build')));


const controllers = require("./controllers");
const propController = require("./plotController");

const fileStorageEngine = multer.diskStorage({
	destination: (req, file, cb) => {
			cb(null, './uploads')
	},
	filename: (req, file, cb) => {
			cb(null, file.originalname);
	},
});

const upload = multer({ storage: fileStorageEngine });

// app.get("/get-objects", controllers.getObjects);
app.post("/add-data" ,  upload.single('file'), controllers.addData);
app.put("/update-data", upload.single('file'), controllers.updateData);
app.delete("/delete-data", upload.single('file'),  controllers.deleteData);
app.put("/update-properties", upload.single('file'), propController.updateProp)
app.get("/download-sample",controllers.downloadSample );

app.listen(3000||process.env.PORT,err => {
	if(err)
		throw err
	console.log('Server started!')
})
