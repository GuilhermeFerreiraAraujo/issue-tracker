'use strict';

var expect = require('chai').expect;
const mongo = require('mongodb').MongoClient;

var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose');

const CONNECTION_STRING = process.env.DB;

var db;

module.exports = function (app) {

  mongo.connect(CONNECTION_STRING, (err, dbo) => {

    db = dbo.db("Cluster0");

    if (err) {
      console.log("Database error: ", err);
    } else {
      console.log(db);
    }
  });

  app.route('/api/issues/:project')

    .get(function (req, res) {
      var project = req.params.project;
      var searchObj = {};

      searchObj.project_name = project;
      searchObj = Object.assign(searchObj, req.query);

      if (req.query.open) {
        searchObj.open = (req.query.open == 'true');
      }

      var results = [];

      db.collection('Issues').find(searchObj).toArray(function (err, results) {
        res.json(results);
      })
    })

    .post(function (req, res) {
      var project = req.params.project;
      var issueTitle = req.body.issue_title;
      var issueText = req.body.issue_text;
      var createdBy = req.body.created_by;
      var assignedTo = req.body.assigned_to;
      var statusText = req.body.status_text;

      if (!project || !issueTitle || !issueText || !createdBy) {
        res.json({ error: "Invalid data" });
        return;
      }

      var newIssue = {
        project_name: project,
        issue_title: issueTitle,
        issue_text: issueText,
        created_by: createdBy,
        assigned_to: assignedTo,
        status_text: statusText,
        open: true,
        created_on: new Date(),
        updated_on: new Date()
      };

      db.collection("Issues").insertOne(newIssue, function (err, response) {
        if (err) {
          console.log("Error inserting data", err);
          res.json({ error: err });
        } else {
          console.log('Record inserted');
          res.json({ data: newIssue });
        }
      });
    })

    .put(function (req, res) {
      var project = req.params.project;

      var id = req.body._id;

      if (!id) {
        res.json({ error: "In order to update you need to send an valid id." });
        return;
      }

      var issueTitle = req.body.issue_title;
      var issueText = req.body.issue_text;
      var assignedTo = req.body.assigned_to;
      var statusText = req.body.status_text;

      var updateObj = {};

      if (issueTitle) {
        updateObj.issue_title = issueTitle;
      }

      if (issueText) {
        updateObj.issue_text = issueTitle;
      }

      if (assignedTo) {
        updateObj.assigned_to = assignedTo;
      }

      if (statusText) {
        updateObj.status_text = statusText;
      }

      if (Object.keys(updateObj).length > 0) {
        updateObj.updated_on = new Date();

        db.collection("Issues").update({
          _id: new ObjectId(id)
        },
          { $set: updateObj }
        );
      }
    })

    .delete(function (req, res) {
      var project = req.params.project;
      var id = req.body._id;

      if (!id) {
        res.json({ error: "_id error." });
        return;
      }

      db.collection("Issues").remove({ "_id": ObjectId(id) });
      res.json({ sucess: 'Deleted ' + id });
    });
};
