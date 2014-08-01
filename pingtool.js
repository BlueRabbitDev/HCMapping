var pg = require('pg');
var express = require('express');
var app = express();
var ping = require('ping');

/*
CREATE TABLE pingtest (
  id serial not null,
  pc_1_name varchar(50), //pc name
  pc_1_status varchar(50), //pc status
  timestamp varchar(50)
)



*/


var connectionString = "postgres://postgres:pwd123!!@10.90.4.133:5432/FM"

var minutes = 1;
var the_interval = minutes * 60 * 1000;
setInterval(function() {
	console.log('pinging!')
  	pingPeople();
}, the_interval);

function pingPeople(){
	pg.connect(connectionString, function(err, client, done) {
    	var handleError = function(err) {
			if(!err) return false;
			done(client);
			next(err);
			return true;

    	};
    	var myQuery = "SELECT pc_1 FROM peeps;"
    
    	//create empty array for hosts
    	
    	client.query(myQuery, function(err, result) {
    		myArray = [];
    		if(result.rowCount == 0) {
    			res.send(500);
      		}
      		else {
      			for(i=0; i<result.rows.length; i++){
      				myArray.push(result.rows[i].pc_1);
      				//console.log(result.rows[i].pc_1)
            		// ping.sys.probe(myhost, function(isAlive){
            		// 	var msg = isAlive ? myhost + ' alive' : myhost + ' dead';
            		// 	console.log(msg);
            		// });
	          	}
      		}
//      		console.log('***** deleting all the stuff from the ping table *****')
      		client.query('DELETE FROM pingtest;', function(err, result){
      			if(!err){/*good!*/}
      		})
      		var date = new Date();
  //    		console.log(date)
	    	myArray.forEach(function(item){
	    		if (item != ' '){
	    			
	    			ping.sys.probe(item, function(isAlive){
	    				var msg = isAlive ? item + ' alive' : item + ' dead';
//	    				console.log("INSERT INTO pingtest(pc_1_name, pc_1_status, timestamp) VALUES ('" + item + "','" + String(isAlive) + "'," + date + ");")
	    				client.query("INSERT INTO pingtest(pc_1_name, pc_1_status, timestamp) VALUES ('" + item + "','" + String(isAlive) + "','" + date + "');", function(err, result){
	    					if(err){
	    						console.log(err)
	    					}
	    				})
	    			});
	    		}
	    	})
    	})
    	done()
    })
}
