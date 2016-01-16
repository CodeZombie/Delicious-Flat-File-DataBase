/* Delicious Flat File DataBase 														*/
/* Written in 2016 by Jeremy Clark (https://github.com/CodeZombie) 						*/
/* Released under the Apache 2.0 License (http://www.apache.org/licenses/LICENSE-2.0)	*/

var DFFDB = DFFDB||{};

Object.freeze(DFFDB.OP = {
	NOT 					: 1,
	OR						: 2,
	//XOR
	GREATER_THAN			: 3,
	LESS_THAN				: 4,
	GREATER_THAN_OR_EQUAL 	: 5,
	LESS_THAN_OR_EQUAL		: 6,
	SORT_ASC				: 7,
	SORT_DSC				: 8
});


DFFDB.Database = function(databaseName_) {
	this.jsonString = JSON.stringify({name : databaseName_, tables : []});
};

DFFDB.DatabaseFromString = function(string_) {
	this.jsonString = string_;
};
DFFDB.DatabaseFromString.prototype = Object.create(DFFDB.Database.prototype);
DFFDB.DatabaseFromString.constructor = DFFDB.DatabaseFromString;

DFFDB.Database.prototype.stringify = function() {
	return this.jsonString;
}

DFFDB.Database.prototype.createTable = function(tableName_) {

	///////////////////////////////////////////////
	//   TODO:   Check if table already exists   //
	///////////////////////////////////////////////
	
	var databaseObject = JSON.parse(this.jsonString);
	
	if(databaseObject === undefined) {
		console.log("Fatal Error: Failed to parse JSON string");
		return -1;
	}
	
	//set up the basic table framework
	var tableIndex = databaseObject.tables.push({tableName : tableName_, columnStructure : [], rows : []}) - 1;
	
	//add each column to the table framework
	for(var i = 1; i < arguments.length; i++) {
		if(typeof arguments[i] !== 'string' && arguments[i][2] !== undefined && arguments[i][2] !== false && arguments[i][2] !== true) {
			console.log("Fatal Error: invalid argument for field 'isStrict'");
			return -1;
		}
		
		databaseObject.tables[tableIndex].columnStructure.push({columnName 	 : typeof arguments[i] === "string" ? arguments[i] : arguments[i][0],
																defaultValue : typeof arguments[i] === "string" ? null 		   : arguments[i][1] || null,
																isTypeStrict : typeof arguments[i] === "string" ? false	 	   : arguments[i][2] === true ? true : false});
	}

	this.jsonString = JSON.stringify(databaseObject);
};


DFFDB.Database.prototype.insertRow = function(tableName_, rowData_ /*, ignoreStrict */) {
	//ignoreStrict (boolean) will insert the default value when hit with a strict type conflict, as opposed to throwing fatal error. Default: false.
	var databaseObject = JSON.parse(this.jsonString);
	
	if(databaseObject === undefined) {
		console.log("Fatal Error: Failed to parse JSON string");
		return -1;
	}
	
	var tableIndex = this.getTableIndex(tableName_);
	if(tableIndex === -1) {
		console.log("Fatal Error: Table does not exist");
		return -1;
	}
	
	var rowObject = {};
	
	for(var i = 0; i < databaseObject.tables[tableIndex].columnStructure.length; i++) { //iterate through all possible columns in the table
		if(rowData_[databaseObject.tables[tableIndex].columnStructure[i].columnName] !== undefined) { //if the rowData_ argument contains a value for this field
			if(databaseObject.tables[tableIndex].columnStructure[i].isTypeStrict === true && typeof databaseObject.tables[tableIndex].columnStructure[i].defaultValue !== typeof rowData_[databaseObject.tables[tableIndex].columnStructure[i].columnName]) { //strict is on, and there is a type mismatch
				if(arguments[2] === true) { //if ignoreStrict is true
					//insert the default value and continue
					rowObject[databaseObject.tables[tableIndex].columnStructure[i].columnName] = databaseObject.tables[tableIndex].columnStructure[i].defaultValue;
					continue;
				}else {
					console.log("Fatal Error: Attempting to insert a " + typeof rowData_[databaseObject.tables[tableIndex].columnStructure[i].columnName] + " into a strict " + typeof databaseObject.tables[tableIndex].columnStructure[i].defaultValue + " row!")
					return -1;
				}
			}
			//insert the value specified by the argument.
			rowObject[databaseObject.tables[tableIndex].columnStructure[i].columnName] = rowData_[databaseObject.tables[tableIndex].columnStructure[i].columnName];
		}else{
			//insert default value
			rowObject[databaseObject.tables[tableIndex].columnStructure[i].columnName] = databaseObject.tables[tableIndex].columnStructure[i].defaultValue;
		}
	}
	
	databaseObject.tables[tableIndex].rows.push(rowObject);

	this.jsonString = JSON.stringify(databaseObject);
}

//returns the index that a table is at in the tables array in a database.
DFFDB.Database.prototype.getTableIndex = function(tableName_) {
	var databaseObject = JSON.parse(this.jsonString);
	
	if(databaseObject === undefined) {
		console.log("Fatal Error: Failed to parse JSON string");
		return -1;
	}
	
	var tableIndex = -1;
	
	for(var i = 0; i < databaseObject.tables.length; i++) {
		if(databaseObject.tables[i].tableName === tableName_) {
			tableIndex = i;
			break;
		}
	}
	
	if(tableIndex === -1) {
		return -1;
	}
	
	return tableIndex;
}