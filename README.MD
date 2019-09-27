# DELICIOUS FLAT FILE DATABASE
#### ITS A SINGLE-STRING DATABASE

## A WHAT??
Its a database system that stores its data as a single string. This is useful for several purposes, including front-end applications that may need to store complex data in LocalStorage.
DFFDB provides a very simple interface for creating, modifying and querying your data.

## HOW DO I USE IT?? 

#### Create a database
` db = new DFFDB.Database("myDB"); `

#### Create a table
`db.createTable("Candidates", "firstName", "lastName", ["chance", 50]);`
	
#### Instert data into table
`db.insertRow("Candidates", {firstName : "Donald", lastName : "Trump", chance : 0});`
`db.insertRow("Candidates", {firstName : "Bernie", lastName : "Sanders", chance : 100});`
`db.insertRow("Candidates", {firstName : "Hillary", lastName : "Clinton"});`

#### Get all data from a table as an array of objects
`db.getRowsFrom("Candidates").objectify();`

#### Filter rows from said array
`db.getRowsFrom("Candidates").where({"firstName":"Bernie"}).objectify();`
`db.getRowsFrom("Candidates").not({"firstName":"Hillary"}).objectify();`

#### DELETE YOUR ROWS
`todo`

#### DELETE YOUR TABLES
`todo`

