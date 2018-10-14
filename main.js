const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var session = require('express-session');
const movieDetailsSchema = require('./models/movieDetails');

// url to connect to mlab MongoDB database.
mongoose.connect("mongodb://heros:nr9Zz8XvX2CPET2@ds135963.mlab.com:35963/tickets-database");

const app = express();

// For session based storage. Not Implemented
app.use(session({
	secret: 'Ticket Reservation App',
	resave: true,
	saveUninitialized: false,
}));

app.use(bodyParser.urlencoded({extended:true})); //req.body args
app.use(bodyParser.json());

app.get('/',(req,res)=>{
  res.send('Welcome');
});

// Returns array of seats based on given number of seats in ascending order
function returnList(numberOfSeats) {
	var someArray=[];
	for(var i=0;i<numberOfSeats;i++) {
		someArray.push(i);
	}
	return someArray;
};

// Save screen name 
app.post('/screens',(req, res, next)=> {
	if(req.body.name && req.body.seatInfo) {
		var availableSeats = {};
		var aisleSeats = {};
		for(var key in req.body.seatInfo){
			availableSeats[key] = returnList(req.body.seatInfo[key].numberOfSeats);
			aisleSeats[key] = req.body.seatInfo[key].aisleSeats;
		}
		// console.log(aisleSeats);
		var screenData = {
			name : req.body.name,
			aisleSeats : aisleSeats,
			available : availableSeats,
			createdAt : new Date(), // Important meta data for debugging
			updatedAt : new Date()
		}
		console.log(screenData);
	}
	movieDetailsSchema.create(screenData, function (err, ticketSaved) {
		if(err) console.log(err);
		else res.status(200).end();
	});
});

app.post('/screens/:screenName/reserve', (req,res, next)=> {
	if(req.body.seats) {
		movieDetailsSchema.findOne({name : req.params.screenName}, function (err, details){
			if(err) console.log(err);
			for(var key in req.body.seats){
				// if the mentioned row for reservation is not available.
				if(details["available"][key]==undefined) 
					res.send("Selected Seats not available").end();
				// console.log(req.body.seats[key]);
				for(var x in req.body.seats[key]){
					for(var y in details["available"][key]){
						if(req.body.seats[key][x] == details["available"][key][y]){
							var index = details["available"][key].indexOf(details["available"][key][y]);
							details["available"][key].splice(index,1);
						}
					}
				}
				console.log(details["available"][key]);
			}
			details["updatedAt"] = new Date();
			movieDetailsSchema.update({"_id":details["_id"]}, details, function (err){
				if(err) res.send("There was an error from our side".end());
				else res.send("Reservation Done").end();
			});
		});
	}
});

app.get('/screens/:screenName/seats', (req, res, next)=> {
	// req.query to get ?status=unreserved
	// req.params to get screenName
	if(req.query.status=='unreserved'){
		var response={};
		movieDetailsSchema.findOne({name : req.params.screenName}, function (err, details){
			response['seats'] = details["available"];
			res.send(response).end();
		});
	}
	if(req.query.numSeats && req.query.choice) {
		var row = req.query.choice[0];
		var startNumber = req.query.choice[1];
		var start = false;
		var singleResponse = true;
		var availableSeats=[];
		movieDetailsSchema.findOne({name : req.params.screenName}, function (err, details){
			for (var x in details["available"][row]){
				if(details["available"][row][x]==startNumber) start=true;
				if(start && req.query.numSeats) {
					if(details["aisleSeats"][row].includes(details["available"][row][x]) 
						&& req.query.numSeats>1) {
						res.send("Contigous seats not chosen").end();
						singleResponse=false;
					} else availableSeats.push(details["available"][row][x]);
					req.query.numSeats--;
				}
			}
			// Cannot set headers after they are sent error[Temp solution]
			if(singleResponse) res.send({"availableSeats":{row:availableSeats}}).end();
		});
	}
});

// app listens for clients at 9090
app.listen(9090,()=>console.log('Listening on port 9090'));