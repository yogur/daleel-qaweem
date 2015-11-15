// BASE SETUP
// =============================================================================


// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectID = require('mongodb').ObjectID;
var url = 'mongodb://test:test@ds037234.mongolab.com:37234/kobby';


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
//router.get('/', function (req, res) {
//    res.sendfile('manage_symptoms.html', { root: __dirname + "/public/" } );
//});

// more routes for our API will happen here

// on routes that end in /symptom
// ----------------------------------------------------
router.route('/api/symptom')

    // create a symptom (accessed at POST http://localhost:8080/api/symptom)
    .post(function (req, res) {

        var topics_array = req.body.topics;
        var symp_id = '';
        //console.log(topics_array[0].toString());

        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);

            //insert symptom
            var new_id = new ObjectID().toString();

            db.collection('symptoms').insertOne({
                "_id" : new_id,
                "name" : req.body.name,
                "description" : req.body.description
            }, function(err, result) {
                assert.equal(err, null);

                //construct json file of symptom then send as a response
                var myObject = {};
                myObject._id = new_id;
                myObject.name = req.body.name;
                myObject.description = req.body.description;
                res.send(myObject);

                symp_id = new_id;

                for(var i = 0; i < topics_array.length; i++){
                    //console.log(topics_array[i] + " --- " + symp_id);
                     updateTopics(db,topics_array[i],symp_id, function() {

                    });
                }

                //db.close();
                //callback(result);
            });

            //db.close();
        });

    })

// get all the symptoms (accessed at GET http://localhost:8080/api/symptom)
    .get(function (req, res) {

        MongoClient.connect(url, function (err, db) {

            if (err) {
                return console.dir(err);
            }

            var collection = db.collection('symptoms');

            collection.find().toArray(function (err, items) {
//console.dir(items);
                res.header("Content-Type", "application/json; charset=utf-8");
                res.send(items);
                db.close();
            });
        });

    });


var removeSymptomFromTopics = function(db,symp_id, callback) {
    db.collection('topics').updateMany(
        { },
        { $pull: { symptoms: { $in: [ symp_id ] }} },
        { multi: true }
        ,
        function(err, results) {
            callback();
        });
};

var updateTopics = function(db,topicId,symptomId, callback) {
    db.collection('topics').updateOne(
        { _id: topicId },
        { $push: { symptoms: symptomId } },
        //{ $push: { symptoms: symptomId.toString() } },
        function(err, results) {
            //console.log(results);
            callback();
        });
};

// on routes that end in /topics
// ----------------------------------------------------
router.route('/api/topics')

// get all the topics
    .get(function (req, res) {

        MongoClient.connect(url, function (err, db) {

            if (err) {
                return console.dir(err);
            }

            var collection = db.collection('topics');

            collection.find().toArray(function (err, items) {
                res.header("Content-Type", "application/json; charset=utf-8");
                res.send(items);
                db.close();
            });
        });

    });



// on routes that end in /editSymptom
// ----------------------------------------------------

router.route('/api/editSymptom')

    .get(function (req, res) {

        MongoClient.connect(url, function (err, db) {

            if (err) {
                return console.dir(err);
            }

            var collection = db.collection('topics');

            collection.find( { "symptoms": req.query.symptom_id },{"_id" : 1}).toArray(function (err, items) {
                res.header("Content-Type", "application/json; charset=utf-8");
                res.send(items);

                db.close();
            });
        });

    })

.post(function (req, res) {

    var topics_array = req.body.topics;
    //console.log(topics_array[0].toString());
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);

        db.collection('symptoms').updateOne(
            { "_id" : req.body.id },
            { $set: { "name": req.body.name, "description": req.body.description} },
            function(err, results) {

                //remove symptom from all topics
                removeSymptomFromTopics(db, req.body.id,function() {

                    //reinsert symptom to modified list of topics
                    for(var i = 0; i < topics_array.length; i++){
                        updateTopics(db,topics_array[i],req.body.id, function() {
                            //
                        });
                    }
                });
                //db.close();
                res.send("Edited a document into the symptoms collection.");
            });

    });

});

// on routes that end in /deleteSymptom
// ----------------------------------------------------

router.route('/api/deleteSymptom')

    .post(function (req, res) {

        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);

            db.collection('symptoms').deleteOne(
                { "_id": req.body.id },

                //callback
                function(err, results) {

                    removeSymptomFromTopics(db, req.body.id,function() {

                        res.send("deleted a document into the symptoms collection.");
                        db.close();
                    });
                }

            );

        });

    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

app.use("/", express.static(__dirname + '/public'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Connected to port: ' + port);