import Games from '../../../router/games';

Template.gamesList.onCreated(function bodyOnCreated() {
});


Template.gamesList.helpers({
    userId: function() {
        return Meteor.userId();
    },

    games: function() {
        return Games.find({"is.public": true, "is.completed": false, "is.playing": false}, {sort: {createdAt: -1}});
    },
    gamesCount: function() {
        return Games.find({"is.public": true, "is.completed": false, "is.playing": false}, {sort: {createdAt: -1}}).count();
    },

    gamesFinished: function() {
        return Games.find({"is.public": true, "is.completed": true}, {sort: {createdAt: -1}, limit : 10});
    },
    gamesFinishedCount: function() {
        return Games.find({"is.public": true, "is.completed": true}, {sort: {createdAt: -1}, limit : 10}).count();
    },

});

Template.gamesList.events({
    'submit #game-create': function(event, template) {
        template.$('#game-create-submit').attr('disabled', 'disabled');

        var gameTitle = template.$('#form-create-title').val();
        var gameIsPublic = true;
        var gameBestOf = 1;
        var roomowner = Meteor.user().emails[0].address;

        Meteor.call('gameInsert', gameTitle, gameBestOf, gameIsPublic, roomowner, '', '', function(error, response) {
            template.$('#game-create-submit').removeAttr('disabled');
        });

        event.preventDefault();
    }
});