import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('tasks', function tasksPublication() {

    return Tasks.find({
      $or: [
      { private: { $ne: true } },
      { owner: this.userId },
      ],
    });
  });
}

