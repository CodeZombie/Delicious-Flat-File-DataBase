/* Delicious Flat File DataBase 														*/
/* Written in 2016 by Jeremy Clark (https://github.com/CodeZombie) 						*/
/* Released under the Apache 2.0 License (http://www.apache.org/licenses/LICENSE-2.0)	*/

var DFDB = DFDB||{};

/*************** Error Basics *****************/

DFDB.ReportErrors = false;

DFDB.Error = function(string_) {
	if(DFDB.ReportErrors === true) {
		console.log("Error: " + string_);
	}
}

/*************** Database Object Basics *****************/

DFDB.Database = function() {
	this.data = {tables : []};
};

DFDB.DatabaseFromString = function(string_) {
	this.data = JSON.parse(string_);
};

DFDB.DatabaseFromString.prototype = Object.create(DFDB.Database.prototype);

DFDB.DatabaseFromString.constructor = DFDB.DatabaseFromString;

DFDB.Database.prototype.stringify = function() {
	return JSON.stringify(this.data);
}

DFDB.Database.prototype.objectify = function() {
	return this.data;
}

/*************** Row Object Basics *****************/

DFDB.Rows = function(columnData_, rowData_) {
	this.columnStructure = JSON.parse(columnData_);
	this.rowData = JSON.parse(rowData_);
}

DFDB.Rows.prototype.stringify = function() {
	return JSON.stringify(this.rowData);
}

DFDB.Rows.prototype.getColumnStructure = function() {
	return this.columnStructure
}

DFDB.Rows.prototype.objectify = function() {
	return this.rowData;
}

/*************** Database Object Create Methods *****************/

DFDB.Database.prototype.createTable = function(tableName_) {
	//check if table already exists:
	for(var i = 0; i < this.data.tables.length; i++) {
		if(this.data.tables[i].tableName === tableName_) {
			DFDB.Error("Attempting to create existing table '" + tableName_ +"'.");
			return -1;
		}
	}
	
	//set up the basic table framework
	var tableIndex = this.data.tables.push({tableName : tableName_, columnStructure : [], rows : []}) - 1;
	
	//add each column to the table framework
	for(var i = 1; i < arguments.length; i++) {
		if(typeof arguments[i] !== 'string' && arguments[i][2] !== undefined && arguments[i][2] !== false && arguments[i][2] !== true) {
			DFDB.Error("invalid argument for field 'isStrict'");
			return -1;
		}
		
		this.data.tables[tableIndex].columnStructure.push({columnName 	 : typeof arguments[i] === "string" ? arguments[i] : arguments[i][0],
																defaultValue : typeof arguments[i] === "string" ? null 		   : arguments[i][1] || null,
																isTypeStrict : typeof arguments[i] === "string" ? false	 	   : arguments[i][2] === true ? true : false});
	}
	
	return this;
};

DFDB.Database.prototype.insertRow = function(tableName_, rowData_) {
	
	//var tableIndex = this.getTableIndex(tableName_);
	var tableIndex = -1;
	
	for(var i = 0; i < this.data.tables.length; i++) {
		if(this.data.tables[i].tableName === tableName_) {
			tableIndex = i;
			break;
		}
	}	
	
	if(tableIndex === -1) {
		DFDB.Error("Table does not exist");
		return -1;
	}
	
	var rowObject = {};
	
	for(var i = 0; i < this.data.tables[tableIndex].columnStructure.length; i++) { //iterate through all possible columns in the table
		if(rowData_[this.data.tables[tableIndex].columnStructure[i].columnName] !== undefined) { //if the rowData_ argument contains a value for this field
			if(this.data.tables[tableIndex].columnStructure[i].isTypeStrict === true && typeof this.data.tables[tableIndex].columnStructure[i].defaultValue !== typeof rowData_[this.data.tables[tableIndex].columnStructure[i].columnName]) { //strict is on, and there is a type mismatch
				DFDB.Error("Attempting to insert a " + typeof rowData_[this.data.tables[tableIndex].columnStructure[i].columnName] + " into a strict " + typeof this.data.tables[tableIndex].columnStructure[i].defaultValue + " row!")
				return -1;
			}
			//insert the value specified by the argument.
			rowObject[this.data.tables[tableIndex].columnStructure[i].columnName] = rowData_[this.data.tables[tableIndex].columnStructure[i].columnName];
		}else{
			//insert default value
			rowObject[this.data.tables[tableIndex].columnStructure[i].columnName] = this.data.tables[tableIndex].columnStructure[i].defaultValue;
		}
	}
	
	this.data.tables[tableIndex].rows.push(rowObject);
	
	return this;
}

/*************** Database Object Read Methods *****************/

DFDB.Database.prototype.getTableIndex = function(tableName_) {
//returns the index that a table is at in the tables array in a database. For internal use only
	var tableIndex = -1;
	
	for(var i = 0; i < this.data.tables.length; i++) {
		if(this.data.tables[i].tableName === tableName_) {
			tableIndex = i;
			break;
		}
	}
	
	return tableIndex;
}

DFDB.getConditionKey = function(columnStructure_, condition_) {
//returns a condition key from a condition object. For internal use only
	for(var i = 0; i < columnStructure_.length; i++) {
		if(condition_[columnStructure_[i].columnName] !== undefined) {
			return columnStructure_[i].columnName;
		}
	}
	return undefined;
}

DFDB.Database.prototype.getRowsFrom = function(tableName_) {
//returns an object containing all rows from a table, along with filtering methods
	
	//var tableIndex = this.getTableIndex(tableName_);
	var tableIndex = -1;
	
	for(var i = 0; i < this.data.tables.length; i++) {
		if(this.data.tables[i].tableName === tableName_) {
			tableIndex = i;
			break;
		}
	}	
	
	if(tableIndex === -1) {
		DFDB.Error("Table does not exist");
		return -1;
	}
	
	//TODO: do more error checking here, if need be
	return new DFDB.Rows(JSON.stringify(this.data.tables[i].columnStructure), JSON.stringify(this.data.tables[i].rows));
}

/*************** Row Object Read Methods *****************/

DFDB.Rows.prototype.where = function(condition_) {
	var newRowData = [];
	var conditionKey = DFDB.getConditionKey(this.columnStructure, condition_);
	
	if(conditionKey === undefined) {	
		DFDB.Error("Unknown key in `where` condition");
	}else {
		for(var i = 0; i < this.rowData.length; i++) {
			if(this.rowData[i][conditionKey] === condition_[conditionKey]) {
				newRowData.push(this.rowData[i]);
			}
		}
	}
	
	this.rowData = newRowData;
	return this;
}

DFDB.Rows.prototype.not = function(condition_) {
	var newRowData = [];
	var conditionKey = DFDB.getConditionKey(this.columnStructure, condition_);
	
	if(conditionKey === undefined) {	
		DFDB.Error("Unknown key in `where` condition");
	}else {
		for(var i = 0; i < this.rowData.length; i++) {
			if(this.rowData[i][conditionKey] !== condition_[conditionKey]) {
				newRowData.push(this.rowData[i]);
			}
		}
	}
	
	this.rowData = newRowData;
	return this;
}

DFDB.Rows.prototype.and = DFDB.Rows.prototype.where;