import { Template } from 'meteor/templating';
import { Tasks } from '../../imports/api/tasks.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import './home.html';
import '../game/game.html'

var lockedItem="";

Template.home.onCreated(function bodyOnCreated() {
	this.state = new ReactiveDict();
	this.state.set("check"," ");
	Meteor.subscribe('tasks');
});

Template.home.helpers({

	tasks() {
		const instance = Template.instance();

    // Show newest tasks at the top
    return Tasks.find({}, { sort: { createdAt: 1 } });
},

afterLogin(){
	if(Meteor.user()!=null){
		Template.instance().state.set("check",null);
	}else{
		$(".game-start-button").html("START");
		$(".game-start-button").attr('value', 'START');
	}
	return Template.instance().state.get("check");
},

});

Template.home.events({

	'click .game-start-button'(event, instance) {

		if($(".game-start-button").attr("value")=="LOCK"){
			console.log("submit");
			Meteor.call('tasks.insert', lockedItem);
			lockedItem = "";
			$(".game-start-button").html("LOCKED");
			$(".game-start-button").attr('value', 'LOCKED');


		}else if ($(".game-start-button").attr("value")!="LOCKED"){
			if(Meteor.user()==null){
				instance.state.set("check","Please login ...");
			}else{
				$(".game-start-button").html("LOCK");
				$(".game-start-button").attr('value', 'LOCK');
			}
		}



	},

	'click .rock-button'(event, instance) {
		console.log("rock");
		lockedItem = "rock";
	},

	'click .paper-button'(event, instance) {
		console.log("paper");
		lockedItem = "paper";
	},

	'click .scissors-button'(event, instance) {
		console.log("scissors");
		lockedItem = "scissors";
	},

});


