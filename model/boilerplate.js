var pg = require("pg");
var config = require("../utility/config");


//creates a new boilerplateDB template each time. 
function createBoilerplate(){
	var boilerplate = {
		/*	
		Boilerplate code to simplify query execution
			IMPORTANT NOTE: The callback MUST have the format of function (err, result) { ... }!
		function	: query
		statement	: "INSERT INTO tblFeedChannel (fedUserID,fedFeedChannelName,fedFeedChannelDesc,fedFeedChannelURL,fedFeedChannelTitleSelector,fedFeedChannelLinkSelector,fedFeedChannelDescriptionSelector, fedFeedChannelImageLinkSelector, fedFeedChannelAncestorSelector,fedFeedChannelIsActive,fedFeedChannelIsCustom) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)"
		args 		: [userid,channelname,descriptionSelector,siteURL,titleSelector,linkSelector,descriptionSelector,imageLinkSelector,ancestorSelector,true,channelIsCustom]
		callback	: 	function (err, result){
							if (err) return next(err);
				
							console.log("Succesfully inserted: " + result);
						}
		*/
		query: function (statement, args, callback){
		  	pg.connect(config.databaseurl, function(err, client, done) {
		  		if (err) return callback(err);
		  		
				console.log("Attempting to execute SQL query: [" +statement + "] \n\tWith arguments: [" + args + "]");
		  		//notice that client.query's callback has a param for RESULT. Don't confuse it with router.get's callback param, RES(PONSE)
				client.query(statement, args, function (err, result) {
					done();
					if (err) return callback(err);

					callback(null, result);

					client.end();
				});
				
			});	
		},

		/* takes a key-value dictionary, spits out an object that contains a pair of "columns" and "values" arrays */
		splitDictionary: function (dictionary, callback){
			var columns = [];
			var values = [];
			for (var key in dictionary) {
			  	if (dictionary.hasOwnProperty(key)) {
			  	  	if (typeof key !== "string"){
			  	  		return callback(new Error("Error: ALL keys must be strings!"));
			  	  	}

			  	  	columns[columns.length] = key;  
			  	  	values[values.length] = dictionary[key];
			  	}
			}

			var returnObj = { columns:columns, values:values };
			return returnObj;
		},
	
		/*
		tblname		: A_table_name
		dictionary : { "userid":"bob", "channelname":"Webspace" }
		callback   : function (err, result) { done(); if (err) return next(err); "business logic goes here"; client.end();}!
		*/
		insert: function (tblname ,dictionary, callback){
			var columns = [];
			var values 	= [];

			if (Object.getOwnPropertyNames(dictionary).length === 0){
				return callback(new Error("Error@Insert: Dictionary cannot be an empty object!"));
			}

			var returnObj = this.splitDictionary(dictionary, callback);
			columns = returnObj.columns;
			values = returnObj.values;

			/*if there were 4 columns, this produces "$1,$2,$3,$4"*/
			var parametricColumns = "";
			for (var i = 0; i < columns.length ; i++){
				var n = i + 1;
				parametricColumns = parametricColumns + "," + "$" + n; 
			}
			parametricColumns = parametricColumns.slice(1);	//slice first ',' away.

			var columnString = columns.toString();

			var statement = "INSERT INTO " + tblname + " (" + columnString + ") VALUES (" + parametricColumns + ")";
			var args = values;
			

			
			this.query(statement,args,callback);
		},
	

		/*
		This is a BASIC select statement. No inherent support for INNER JOIN syntax queries
		tblname 		: "tblFeedChannel"
		columns 		: [ "fedFeedChannelName", "fedFeedChannelDesc"]
		whereDictionary	: { "fedFeedChannelID":1 } OR simply null if no "Where" condition needed
		callback 		: function (err, result) { .. }
		*/
		select: function (columns,tblName,whereDictionary, callback){
			if(columns.constructor !== Array){
				return callback(new Error("An array of columns to select must be provided!"));
			}
			if (columns.length == 0){
				return callback(new Error("You must supply at least one column to select from!"));
			}


			var columnString = columns.toString();
			var args = [];

			var statement = "SELECT " + columns + " FROM " + tblName;
			if (whereDictionary){
				var whereString = " WHERE ";

				var returnObj = this.splitDictionary(whereDictionary, callback);
				columns = returnObj.columns;
				values = returnObj.values;

				for (var i=0; i<columns.length; i++){
					whereString = whereString + columns[i] + "=" + "$" + (i+1) + " AND ";
				}
				whereString = whereString.slice(0,whereString.length-4);

				statement = statement + whereString;
				args = values;
			}

			this.query(statement,args,callback);
		}
	}

	return boilerplate;
}

module.exports = createBoilerplate;