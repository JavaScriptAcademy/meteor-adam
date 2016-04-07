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
		Tasks.find().forEach(function(myDoc) { console.log( "user: " + myDoc.lockedItem ); });
    	// Show newest tasks at the top
    	// console.log(results.length);
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
    
    scissorscount(){
    	var num = 0;

    	Tasks.find({lockedItem : "scissors"}).forEach(
    		function(myDoc) { 
    			num++;
    		});
    	return num;
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


		}else if ($(".game-start-button").attr("value")=="START"){
			if(Meteor.user()==null){
				instance.state.set("check","Please login ...");
			}else{
				$(".game-start-button").html("LOCK");
				$(".game-start-button").attr('value', 'LOCK');
				var oneMinue = new Date().getTime() + 6000;
				$('.time-countdown').countdown(oneMinue, function(event) {
					$(this).html(event.strftime('%M:%S'));
				}).on('finish.countdown', function(event) {
					$(this).html('Game end!');

				});;

				 // Initialize a Line chart in the container with the ID chart1

				 console.log(scissorscount());

				 var data = {
				 	series: [scissorscount(), rockscount(), paperscount()]
				 };

				 var sum = function(a, b) { return a + b };

				 new Chartist.Pie('.ct-chart', data, {
				 	labelInterpolationFnc: function(value) {
				 		return Math.round(value / data.series.reduce(sum) * 100) + '%';
				 	}
				 });
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

var paperscount = function(){
	var num = 0;
	Tasks.find({lockedItem : "paper"}).forEach(
		function(myDoc) { 
			num++;
		});
	return num;
};

var rockscount = function(){
	var num = 0;
	Tasks.find({lockedItem : "rock"}).forEach(
		function(myDoc) { 
			num++;
		});
	return num;
};

var scissorscount = function(){
	var num = 0;

	Tasks.find({lockedItem : "scissors"}).forEach(
		function(myDoc) { 
			num++;
		});
	return num;
};


