var pg = require('pg');
var express = require('express');
var app = express();
var ping = require('ping');
var fs = require('fs');
//var dropzone = require('dropzone');

//var connectionString = "postgres://postgres:0792441000@localhost:5433/postgis"
var connectionString = "postgres://postgres:pwd123!!@10.90.4.133:5432/FM"
app.use(express.static(__dirname + '/public'));
app.use(express.json());

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/floor', function(req, res){
  //<address>.com/floor?floor=6&group=Water%20resources
  var floor = req.query.floor,
      group = req.query.group,
      position = req.query.position;


  console.log(floor)

  if (floor != "undefined") {
    pg.connect(connectionString, function(err, client, done) {
      var handleError = function(err) {
        if(!err) return false;
        done(client);
        next(err);
        return true;

      };



      singleQuote = "'"
      var selectStatement = 'SELECT "peeps".*, ST_AsGeoJSON(ST_Centroid("cubes".geom)) AS centroid, ST_AsGeoJSON("cubes".geom) AS geometry '
      var fromStatement = 'FROM "cubes" INNER JOIN "peeps" ON "cubes".spaceid = "peeps".location '
      var whereStatement = 'WHERE cubes.floor=' + singleQuote +  floor + singleQuote
      if(group != undefined){
        whereStatement = whereStatement + ' AND "peeps".groupnm = ' + singleQuote +  group + singleQuote
      }
      if(position != undefined){
        whereStatement = whereStatement + ' AND "peeps".business_line = ' + singleQuote +  position + singleQuote
      }
      whereStatement + ";";

      var queryString = selectStatement + ' ' + fromStatement + ' ' + whereStatement;
      console.log(queryString)
      client.query(queryString, function(err, result) {
        console.log(queryString)
        if(result.rowCount == 0) {
          res.send(500);
        }
        else {
          var featureCollection = new FeatureCollection();
          for(i=0; i<result.rows.length; i++){
            var feature = new Feature();
            feature.properties = ({"Name":result.rows[i].knownas, "Email":result.rows[i].email, "Extension":result.rows[i].email, "Location":result.rows[i].location, "PC_Name":result.rows[i].pc_1, "Group":result.rows[i].groupnm, "Position":result.rows[i].position, "Centroid":result.rows[i].centroid});
            feature.geometry = JSON.parse(result.rows[i].geometry);
            featureCollection.features.push(feature);
          }
          //res.type('application/json');
          res.jsonp(featureCollection);
          done();
        }
      });
    });
  }
  else{
    res.send("<h2>These are not the droids you were looking for.</h2></br>")
  }
});

app.get('/divisionnm', function(req, res){
	
  pg.connect(connectionString, function(err, client, done) {
    var handleError = function(err) {
      if(!err){
	  
	   return false;
	  }
	   
      done(client);
      next(err);
      return true;

    };
   
    var myQuery = "SELECT division FROM officelocations GROUP BY division;"
  
    
    client.query(myQuery, function(err, result) {
	console.log("Results: "+ result);
      if(result.rowCount == 0) {
        res.send(500);
      }
      else {
        
        var nogeo = new noGeo();
        for(i=0; i<result.rows.length; i++){
         
          nogeo.available.push(result.rows[i].division);
        }
       
        res.jsonp(nogeo);
        done();
      }
    })
  });
});

app.get('/officename', function(req, res){
	
  pg.connect(connectionString, function(err, client, done) {
    var handleError = function(err) {
      if(!err){
	  
	   return false;
	  }
	   
      done(client);
      next(err);
      return true;

    };
	
   
    var myQuery = "SELECT officenm FROM officelocations;"
  
    
    client.query(myQuery, function(err, result) {
	console.log("Results: "+ result);
      if(result.rowCount == 0) {
        res.send(500);
      }
      else {
        
        var nogeo = new noGeo();
        for(i=0; i<result.rows.length; i++){
         
          nogeo.available.push(result.rows[i].officenm);
		  
        }
       
        res.jsonp(nogeo);
        done();
      }
    })
  });
});


app.get('/peopleSearch', function(req, res){
  //<address>.com/floor?floor=6&group=Water%20resources
  var person = req.query.person,
    group = req.query.group,
    floor = req.query.floor;
  var count = 0;
  if (person != "undefined") {
    pg.connect(connectionString, function(err, client, done) {
      var handleError = function(err) {
        if(!err) return false;
        done(client);
        next(err);
        return true;

      };
      singleQuote = "'"
      var selectStatement = 'SELECT "peeps".*, ST_AsText(ST_Centroid("cubes".geom)) AS centerPoint, ST_AsGeoJSON("cubes".geom) AS geometry '
      var fromStatement = 'FROM "cubes" INNER JOIN "peeps" ON "cubes".spaceid = "peeps".location '
      if(person || floor || group){
        var whereStatement = 'WHERE '
      }
      else{
        whereStatement = '';
      }

      if(floor != undefined){
        if(count == 0){
          whereStatement = whereStatement + 'cubes.floor=' + singleQuote +  floor + singleQuote;
          count = count + 1;
        }
        else{
          whereStatement = whereStatement + ' AND cubes.floor=' + singleQuote +  floor + singleQuote;
        }

      }
      if(person != undefined){
        if(count == 0){
          whereStatement = whereStatement + ' peeps.knownas like ' + singleQuote + '%' +  person + '%' + singleQuote;
          count = count + 1;
        }
        else{
          whereStatement = whereStatement + ' AND peeps.knownas like ' + singleQuote + '%' +  person + '%' + singleQuote;
        }
      }
      if(group != undefined){
        if(count == 0){
          whereStatement = whereStatement + ' peeps.groupnm = ' + singleQuote +  group + singleQuote;
          count = count + 1;
        }
        else{
          whereStatement = whereStatement + ' AND peeps.groupnm = ' + singleQuote +  group + singleQuote;
        }
      }
      whereStatement + ";";
	  
	

      var queryString = selectStatement + ' ' + fromStatement + ' ' + whereStatement;
      console.log(queryString)
      client.query(queryString, function(err, result) {
        console.log(queryString)
        if(result.rowCount == 0) {
          res.send(500);
        }
        else {
          var featureCollection = new FeatureCollection();
          for(i=0; i<result.rows.length; i++){
            var feature = new Feature();
            feature.properties = ({"Name":result.rows[i].knownas,
                                   "Email":result.rows[i].email,
                                   "Extension":result.rows[i].email,
                                   "Location":result.rows[i].location,
                                   "PC_Name":result.rows[i].pc_1,
                                   "Group":result.rows[i].groupnm,
                                   "Position":result.rows[i].position,
                                   "centerpoint":result.rows[i].centerpoint
            });
            feature.geometry = JSON.parse(result.rows[i].geometry);
            featureCollection.features.push(feature);
          }
          //res.type('application/json');
          res.jsonp(featureCollection);
          done();
        }
      });
    });
  }
  else{
    res.send("<h2>These are not the droids you were looking for.</h2></br>")
  }
});

app.get('/groupnm', function(req, res){
  var position = req.query.position;

  pg.connect(connectionString, function(err, client, done) {
    var handleError = function(err) {
      if(!err) return false;
      done(client);
      next(err);
      return true;

    };
    if(position != undefined){
      var myQuery = "SELECT groupnm FROM peeps WHERE business_line='" + position + "' GROUP BY groupnm;"
    }
    else{
      var myQuery = "SELECT groupnm FROM peeps GROUP BY groupnm;"
    }
    
    client.query(myQuery, function(err, result) {
      if(result.rowCount == 0) {
        res.send(500);
      }
      else {
        //var featureCollection = new FeatureCollection();
        //var openspots = new noGeo("positions")
        var nogeo = new noGeo();
        for(i=0; i<result.rows.length; i++){
          //var feature = new Feature();
          //feature.properties = ({"position":result.rows[i].position});
          
          nogeo.available.push(result.rows[i].groupnm);
        }
        //res.type('application/json');
        res.jsonp(nogeo);
        done();
      }
    })
  });
});

app.get('/position', function(req, res){
  var group = req.query.group;
  
  pg.connect(connectionString, function(err, client, done) {
    var handleError = function(err) {
      if(!err) return false;
      done(client);
      next(err);
      return true;

    };
    if(group != undefined){
      var myQuery = "SELECT business_line FROM peeps WHERE groupnm = '" + group + "' GROUP BY business_line;"
    }
    else{
      var myQuery = "SELECT business_line FROM peeps GROUP BY business_line;"
    }
    
    client.query(myQuery, function(err, result) {
      if(result.rowCount == 0) {
        res.send(500);
      }
      else {
        //var featureCollection = new FeatureCollection();
        //var openspots = new noGeo("positions")
        var nogeo = new noGeo();
        for(i=0; i<result.rows.length; i++){
          //var feature = new Feature();
          //feature.properties = ({"position":result.rows[i].position});
          
          nogeo.available.push(result.rows[i].business_line);
        }
        //res.type('application/json');
        res.jsonp(nogeo);
        done();
      }
    })
  });
});

 decodeBase64 = function(s) {
    var e={},i,b=0,c,x,l=0,a,r='',w=String.fromCharCode,L=s.length;
    var A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for(i=0;i<64;i++){e[A.charAt(i)]=i;}
    for(x=0;x<L;x++){
        c=e[s.charAt(x)];b=(b<<6)+c;l+=6;
        while(l>=8){((a=(b>>>(l-=8))&0xff)||(x<(L-2)))&&(r+=w(a));}
    }
    return r;
};
	
app.post('/updateUser', function(req, res){
  console.log(req.body);
  var m_location = req.body.m_Location,
		m_extension = req.body.Extension,
		m_email = req.body.Email,
		m_fname = req.body.FName,
		m_lname = req.body.LName,
		m_sourseUrl = decodeBase64(req.body.SourseURL),
		m_buisnessLine = req.body.BusinessLine,
		m_iphone = req.body.iPhone,
		m_blackBerry = req.body.BBerry,
		m_floor = req.body.m_Floor,
		m_group = req.body.m_Group,
		m_position = req.body.m_Position,
		m_name = req.body.Name;
		//console.log(m_sourseUrl);

/*
  //Set Portion
  var setString = 'UPDATE peeps SET ';
  if(req.body.Name){
    setString = setString + ' knownas = "' + req.body.Name + '" ';
  }
  if(req.body.Email){
    setString = setString + ', email = "' + req.body.Email + '" ';
  }
  if(req.body.Extension){
    setString = setString + ', extension = "' + req.body.Extension + '" ';
  }
  if(req.body.Location){
    setString = setString + ', location = "' + req.body.Location + '" ';
  }
  if(req.body.PC_Name){
    setString = setString + ', pc_1 = "' + req.body.PC_Name + '" ';
  }
  if(req.body.Group){
    setString = setString + ', groupnm = "' + req.body.Group + '" ';
  }
  if(req.body.Position){
    setString = setString + ', position = "' + req.body.Position + '" ';
  }
  if(req.body.Sourse){
    setString = setString + ', sourse_url = "' + req.body.Sourse + '" ';
  }
*/
  //Where Portion
  //var whereString = "WHERE knownas = '" + name + "' AND location = '" + location + "';"
  //var whereString = "WHERE extension = '" + extension + "';"
  
/*
UPDATE table
SET column1 = value1, column2 = value2 ,...
WHERE condition;
*/
  pg.connect(connectionString, function(err, client, done) {
    var handleError = function(err) {
      if(!err) return false;
      done(client);
      next(err);
	  console.log(err);
      return true;
    };
	
    //var myQuery = setString + whereString;
	//--Testing:
	var myQuery = "update peeps set  firstname = ($2), lastname = ($3), knownas = ($4), email = ($5), sourse_url = ($6), business_line = ($7), iphone = ($8), blackberry = ($9), floor = ($10), location = ($11), groupnm = ($12), position = ($13) where extension = ($1)";
	//var myQuery = "update peeps set  firstname = ($2), lastname = ($3), knownas = ($4), email = ($5), business_line = ($6), iphone = ($7), blackberry = ($8), floor = ($9), location = ($10), groupnm = ($11), position = ($12) where extension = ($1)";
    console.log(myQuery);
    client.query(myQuery, [m_extension, m_fname, m_lname, m_name, m_email, m_sourseUrl, m_buisnessLine, m_iphone, m_blackBerry, m_floor, m_location, m_group, m_position], function(err, result) {
	//client.query(myQuery, [m_extension, m_fname, m_lname, m_name, m_email, m_buisnessLine, m_iphone, m_blackBerry, m_floor, m_location, m_group, m_position], function(err, result) {
      if(!err){
        done();
		//sendResponse(res, result.rows[0]);
		console.log("updated");
		return false;
      }
      else{
        console.log(err);
		console.log("error occurred");
      }
      // if(result.rowCount == 0) {
      //   res.send(500);
      // }
      // else {
      //   //var featureCollection = new FeatureCollection();
      //   //var openspots = new noGeo("positions")
      //   var nogeo = new noGeo();
      //   for(i=0; i<result.rows.length; i++){
      //     //var feature = new Feature();
      //     //feature.properties = ({"position":result.rows[i].position});
          
      //     nogeo.available.push(result.rows[i].position);
      //   }
      //   //res.type('application/json');
      //   res.jsonp(nogeo);
      //   done();
      // }
    })
  });
});

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

app.post('/updatePeepPhoto', function(req, res){
try{
	console.log("inside updatePhoto");
	console.log(req.body.ImageString);
	console.log(req.body.ImageName);
	console.log(req.body.Extension);

  var m_image = req.body.ImageString, 
  m_name = req.body.ImageName,
  m_extension = req.body.Extension;
  
  m_name.replace(".jpg", "");
  m_name.replace(".jpeg", "");
  m_name.replace(".png", "");
  
	//var decodedImage = new Buffer(m_image, 'base64');
	var decodedImage = new Buffer(m_image, 'base64');
	console.log('writing image: ' + __dirname+'/public/assets/img/Profile/'+m_name+'.jpg');
    fs.writeFile(__dirname+'/public/assets/img/Profile/'+m_name+'.jpg', decodedImage, function(err) {});
	
	console.log("photo written to profile folder...");
	
	  pg.connect(connectionString, function(err, client, done) {
		var handleError = function(err) {
		  if(!err) return false;
		  done(client);
		  next(err);
		  console.log(err);
		  return true;
		};

		var myQuery = "update peeps set  costctrn = ($2) where extension = ($1)";
		console.log(myQuery);
		client.query(myQuery, [m_extension, m_name+'.jpg'], function(err, result) {
		  if(!err){
			done();
			console.log("photo updated");
			res.responseJSON = '{"Success":"Photo Uploaded Successfully"}'
			return true;
		  }
		  else{
			console.log(err);
			console.log("error occurred");
			res.responseJSON = '{"Failed":"Photo Uploaded Successfully"}'
		  }

		})
	  });
	  
	}
	catch (err) {
	consol.log(err);
	}
});

app.post('/clearUser', function(req, res){
  console.log(req.body);
  var     m_extension = req.body.Extension;

  pg.connect(connectionString, function(err, client, done) {
    var handleError = function(err) {
      if(!err) return false;
      done(client);
      next(err);
    console.log(err);
      return true;
    };
  
    //var myQuery = setString + whereString;
  //--Testing:
  var myQuery = "update peeps set  firstname = '', lastname = '',  knownas = '',  email = '',  costctrn = 'NoPhoto2_Grey.JPG', sourse_url = '',  business_line = '',  iphone = '',  blackberry = '',  groupnm = '',  position = ''  where extension = ($1)";
  //var myQuery = "update peeps set  firstname = ($2), lastname = ($3), knownas = ($4), email = ($5), business_line = ($6), iphone = ($7), blackberry = ($8), floor = ($9), location = ($10), groupnm = ($11), position = ($12) where extension = ($1)";
    console.log(myQuery);
    client.query(myQuery, [m_extension], function(err, result) {
  //client.query(myQuery, [m_extension, m_fname, m_lname, m_name, m_email, m_buisnessLine, m_iphone, m_blackBerry, m_floor, m_location, m_group, m_position], function(err, result) {
      if(!err){
        done();
    //sendResponse(res, result.rows[0]);
    console.log("updated");
    return false;
      }
      else{
        console.log(err);
    console.log("error occurred");
      }
      // if(result.rowCount == 0) {
      //   res.send(500);
      // }
      // else {
      //   //var featureCollection = new FeatureCollection();
      //   //var openspots = new noGeo("positions")
      //   var nogeo = new noGeo();
      //   for(i=0; i<result.rows.length; i++){
      //     //var feature = new Feature();
      //     //feature.properties = ({"position":result.rows[i].position});
          
      //     nogeo.available.push(result.rows[i].position);
      //   }
      //   //res.type('application/json');
      //   res.jsonp(nogeo);
      //   done();
      // }
    })
  });
});

app.get('/ping', function(req, res){
  //<address>.com/floor?floor=6&group=Water%20resources
  var floor = req.query.floor,
      group = req.query.group,
      position = req.query.position;


  console.log(floor)

  if (floor != "undefined") {
    pg.connect(connectionString, function(err, client, done) {
      var handleError = function(err) {
        if(!err) return false;
        done(client);
        next(err);
        return true;

      };



      singleQuote = "'"
      var selectStatement = 'SELECT "peeps".*, "pingtest".pc_1_status AS laptop_online, ST_AsGeoJSON(ST_Centroid("cubes".geom)) AS centroid, ST_AsGeoJSON("cubes".geom) AS geometry '
      var fromStatement = 'FROM "cubes" INNER JOIN "peeps" ON "cubes".spaceid = "peeps".location FULL OUTER JOIN "pingtest" ON "peeps".pc_1 = "pingtest".pc_1_name '
      var whereStatement = 'WHERE cubes.floor=' + singleQuote +  floor + singleQuote
      if(group != undefined){
        whereStatement = whereStatement + ' AND "peeps".groupnm = ' + singleQuote +  group + singleQuote
      }
      if(position != undefined){
        whereStatement = whereStatement + ' AND "peeps".business_line = ' + singleQuote +  position + singleQuote
      }
      whereStatement + ";";

      var queryString = selectStatement + ' ' + fromStatement + ' ' + whereStatement;
      console.log(queryString)
      client.query(queryString, function(err, result) {
        console.log(queryString)
        if(result.rowCount == 0) {
          res.send(500);
        }
        else {
          var featureCollection = new FeatureCollection();
          for(i=0; i<result.rows.length; i++){
            var feature = new Feature();
            feature.properties = ({
				"PCStatus":result.rows[i].laptop_online,
				"FirstName":result.rows[i].firstname, 
				"LastName":result.rows[i].lastname, 
				"Name":result.rows[i].knownas, 
				"Email":result.rows[i].email,
				"Location":result.rows[i].location, 
				"Floor":result.rows[i].floor, 
				"Wing":result.rows[i].wing, 
				"Building":result.rows[i].building,
				"Office":result.rows[i].office,	
				"UserType":result.rows[i].usertype,
				"Page":result.rows[i].page,
				"PageNum":result.rows[i].pagenumber,
				"AED":result.rows[i].aed,
				"FloorWarde":result.rows[i].floorwarde,
				"PC_Name":result.rows[i].pc_1,
				"PC_Name2":result.rows[i].pc_2,
				"PC_Name3":result.rows[i].pc_3,
				"BusinessLine":result.rows[i].business_line,
				"Iphone":result.rows[i].iphone,
				"Blackberry":result.rows[i].blackberry,
				"AirCard":result.rows[i].aircard,
				"Group":result.rows[i].groupnm, 
				"Position":result.rows[i].position, 
				"Centroid":result.rows[i].centroid, 
				"Picture":result.rows[i].costctrn,
				"Costctr":result.rows[i].costctr,				
				"Sourse":result.rows[i].sourse_url, 
				"Profilelin":result.rows[i].profilelin, 
				"Extension":result.rows[i].extension,
				"CanReserve":result.rows[i].can_reserve 
			});
            feature.geometry = JSON.parse(result.rows[i].geometry);
            featureCollection.features.push(feature);
          }
          //res.type('application/json');
          res.jsonp(featureCollection);
          done();
        }
      });
    });
  }
  else{
    res.send("<h2>These are not the droids you were looking for.</h2></br>")
  }
});

function FeatureCollection(){
  this.type = 'FeatureCollection';
  this.features = new Array();
}

function Feature(){
  this.type = 'Feature';
  this.geometry = new Object;
  this.properties = new Object;
}

function noGeo(){
  this.type = 'NoGeo';
  this.available = new Array();
}

app.listen(8005);
console.log('listening on port 8005');
