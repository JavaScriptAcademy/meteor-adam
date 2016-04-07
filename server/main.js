import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

Meteor.startup(() => {
  // code to run on server at startup
});



Meteor.methods({
	'tasks.insert'(lockedItem) {
		check(lockedItem, String);
 		// Make sure the user is logged in before inserting a task
 		if (! Meteor.userId()) {
 			throw new Meteor.Error('not-authorized');
 		}

 		var existuser = false;
 		var id= "";

 		// console.log(Tasks.find({owner:Meteor.userId()}));
 		Tasks.find({username:Meteor.user().username}).forEach(
 			function(myDoc) { 
 				console.log( "user: " + myDoc._id );
 				existuser=true; 
 				id = myDoc._id;
 			});
 		if(existuser){
 			Tasks.update(id, { $set: { lockedItem: lockedItem } });
 		}else{
 			Tasks.insert({
 				lockedItem,
 				createdAt: new Date(),
 				owner: Meteor.userId(),
 				username: Meteor.user().username,
 			},(err, result)=>{
 				console.log(err);
 			});
 		}	
 	},

 	'tasks.remove'(taskId) {
 		check(taskId, String);

 		const task = Tasks.findOne(taskId);
 		if (task.private && task.owner !== Meteor.userId()) {
      	// If the task is private, make sure only the owner can delete it
      	throw new Meteor.Error('not-authorized');
      }

      Tasks.remove(taskId);
  },


  'tasks.update'(taskId, lockedItem) {
  	check(taskId, String);

  	const task = Tasks.findOne(taskId);

  	Tasks.update(taskId, { $set: { text: lockedItem } });
  },

});

