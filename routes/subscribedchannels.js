var express = require("express");
var router = express.Router();
var boilerplate = (require("../model/boilerplate.js"))();


//html version
router.get("/", function (req,res,next){
	var dictionary = { 
		"id" 	: 2,
		"name" 	: "Hello from my new shiny insert function!" 
	}

	dictionary = null;
	boilerplate.select(["*"], "tblFeedChannel", dictionary, function (err, result){
		if (err) throw err;


		res.write("heya \n");
		res.write("" + JSON.stringify(result));
		res.end("\nhey ho");
	});
});


//JSON version
router.get("/JSON",function (req,res,next){
	res.header("Content-Type", "application/json");




});

function getDatabases(){


}


module.exports = router;