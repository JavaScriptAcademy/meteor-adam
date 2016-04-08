import { Template } from 'meteor/templating';
import { Tasks } from '../../imports/api/tasks.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';

import './chartpie.html'


Template.chart.onCreated(function bodyOnCreated() {
	this.state = new ReactiveDict();
	Meteor.subscribe('tasks');
});

Tracker.autorun(function () {
	
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

	// console.log("paperscount" + paperscount());
	// console.log("rockscount" + rockscount());
	// console.log("scissorscount" +scissorscount());

	var data = {
		series: [scissorscount(), rockscount(), paperscount()]
		
	};

	var sum = function(a, b) { return a + b };

	new Chartist.Pie('.ct-chart', data, {
		labelInterpolationFnc: function(value) {
			return Math.round(value / data.series.reduce(sum) * 100) + '%';
		}
	});

});

// Template.chart.rendered = function(){
// 	var data = {
// 		series: [scissorscount(), rockscount(), paperscount()]
// 		// series: [1, 2, 3]
// 	};

// 	var sum = function(a, b) { return a + b };
// 	// new Chartist.Pie('.ct-chart', data, {labelInterpolationFnc: function(value) {
// 	// 	return Math.round(value / data.series.reduce(sum) * 100) + '%';
// 	// }}
// 	// );

// 	new Chartist.Pie('.ct-chart', data, {
// 		labelInterpolationFnc: function(value) {
// 			return Math.round(value / data.series.reduce(sum) * 100) + '%';
// 		}
// 	});
// };



