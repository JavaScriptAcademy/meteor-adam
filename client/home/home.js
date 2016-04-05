import { Template } from 'meteor/templating';
import { Tasks } from '../../imports/api/tasks.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import './home.html';
import '../game/game.html'

Template.home.onCreated(function bodyOnCreated() {
	this.state = new ReactiveDict();
	this.state.set("check","");
	Meteor.subscribe('tasks');
});

Template.home.helpers({
	tasks() {
		const instance = Template.instance();
		if (instance.state.get('hideCompleted')) {
      // If hide completed is checked, filter tasks
      return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: 1 } });
  }

    // Show newest tasks at the top
    return Tasks.find({}, { sort: { createdAt: 1 } });
},

incompleteCount() {
	return Tasks.find({ checked: { $ne: true } }).count();
},

alterlogin(){
	if(Meteor.user()!=null){
		instance.state.set("check","");
	}
	return Template.instance().state.get("check");
},
});

Template.home.events({
	'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const text = target.text.value;

    // Insert a task into the collection
    Tasks.insert({
    	text,
      createdAt: new Date(), // current time
      owner: Meteor.userId(),
      username: Meteor.user().username,
  });

    // Insert a task into the collection
    Meteor.call('tasks.insert', text);

    // Clear form
    target.text.value = '';
},

'click .game-start-button'(event, instance) {

	if(Meteor.user()==null || Meteor.user().username ==""){
		instance.state.set("check","Please login ...");
	}else{
		$(".game-start-button").fadeOut();
	}

},

'click .rock-button'(event, instance) {
	console.log("rock");
},

'click .paper-button'(event, instance) {
	console.log("paper");
},

'click .scissors-button'(event, instance) {
	console.log("scissors");
},

});


