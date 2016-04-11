import Games from '../../../router/games';

Games.allow({
    insert: function (userId, doc) {
        return (userId && doc.playerOne.id === userId);
    },
    update: function (userId, doc, fields, modifier) {
        return doc.playerOne.id === userId;
    },
    remove: function (userId, doc) {
        return doc.playerOne.id === userId;
    },
    fetch: ['playerOne.id']
});

Meteor.methods({

    // add new game
    gameInsert: function(gameTitle, gameBestOf, gameIsPublic,roomowner, playerOne, playerTwo){
        // check user signed in
        check(Meteor.userId(), String);

        // validate data
        check(gameTitle, String);
        check(gameBestOf, Number)
        check(gameIsPublic, Boolean);

        if(typeof playerOne === 'undefined' || playerOne === '') {
            playerOne = {id: Meteor.userId(), name: Meteor.user().emails[0].address, score: 0, ready: false, winner: false};
        }
        if(typeof playerTwo === 'undefined' || playerTwo === '') {
            playerTwo = {id: "0", name: "Waiting for player...", score: 0, ready: false, winner: false};
        }

        // create game document (object)
        var game = {
            title: gameTitle,
            createby: roomowner,
            playerOne: playerOne,
            playerTwo: playerTwo,
            bestOf: gameBestOf,
            current: {set: 0, interval: 0, showAnimation: false, playAgain: false},
            is: {playing: false, completed: false, public: gameIsPublic},
        };

        // insert new game
        var gameId = Games.insert(game);

        return gameId;
    },

    // player joined game
    gameUpdatePlayerTwo: function(gameId) {
        // validate data
        check(gameId, String);
        check(Meteor.userId(), String);

        var playerTwo = {id: Meteor.userId(), name: Meteor.user().emails[0].address, score: 0, ready: false, winner: false};

        Games.update(gameId, {$set: {playerTwo: playerTwo}});

        return playerTwo;
    },

    // player says is ready to play
    gameUpdatePlayerReady: function(gameId, isPlayerOne) {
        // validate data
        check(gameId, String);
        check(Meteor.userId(), String);

        if(isPlayerOne) {
            Games.update(gameId, {$set: {"playerOne.ready": true}});
        } else {
            Games.update(gameId, {$set: {"playerTwo.ready": true}});
        }

        return true;
    },

    // start game
    gameUpdateIsPlaying: function(gameId) {
        // validate data
        check(gameId, String);
        check(Meteor.userId(), String);

        Games.update(gameId, {$set: {is: {playing: true, completed: false, public: true}}});

        return true;
    },

    // called after choosing object (rock / paper / scissor) for both the user
    gameAddSet: function(game, playerSelection) {
        var sets = game.sets;

        var currentSet = game.current.set;
        var responseGameAddSet = {updateCurrentSet: currentSet, tie: false};

        if(!sets) {
            sets = [];
            sets[currentSet] = {setNumber: currentSet};
        } else {
            if(typeof sets[currentSet] === 'undefined') {
                sets[currentSet] = {setNumber: currentSet};
            }
        }

        if(game.playerOne.id === Meteor.userId()) {
            if(typeof sets[currentSet].playerOneSelection === 'undefined') {
                sets[currentSet].playerOneSelection = playerSelection;
            }
        } else {
            if(typeof sets[currentSet].playerTwoSelection === 'undefined') {
                sets[currentSet].playerTwoSelection = playerSelection;
            }
        }

        if(typeof sets[currentSet].playerOneSelection !== 'undefined' && typeof sets[currentSet].playerTwoSelection !== 'undefined') {
            responseGameAddSet.updateCurrentSet++;
            if(
                sets[currentSet].playerOneSelection === 'scissors' && sets[currentSet].playerTwoSelection === 'paper' ||
                sets[currentSet].playerOneSelection === 'paper' && sets[currentSet].playerTwoSelection === 'rock' ||
                sets[currentSet].playerOneSelection === 'rock' && sets[currentSet].playerTwoSelection === 'scissors'
                ) {
                sets[currentSet].result = game.playerOne.name;
            Games.update(game._id, {$inc: {"playerOne.score": 1}});
            responseGameAddSet.tie = false
        } else if(
            sets[currentSet].playerTwoSelection === 'scissors' && sets[currentSet].playerOneSelection === 'paper' ||
            sets[currentSet].playerTwoSelection === 'paper' && sets[currentSet].playerOneSelection === 'rock' ||
            sets[currentSet].playerTwoSelection === 'rock' && sets[currentSet].playerOneSelection === 'scissors'
            ) {
            sets[currentSet].result = game.playerTwo.name;
            Games.update(game._id, {$inc: {"playerTwo.score": 1}});
            responseGameAddSet.tie = false
        } else {
            sets[currentSet].result = 'Draw';
            responseGameAddSet.tie = true;
        }
    }

    Games.update(game._id, {$set: {"current.set": responseGameAddSet.updateCurrentSet, sets: sets}});

    return responseGameAddSet;
},
    // mark game completed
    gameUpdateIsCompletedAndIsPlaying: function(gameId) {
        var game = Games.findOne({_id: gameId});
        if(game && game.is.completed === false && game.is.playing === true) {
            // validate data
            check(gameId, String);
            check(Meteor.userId(), String);

            Games.update(gameId, {$set: {"is.completed": true, "is.playing": false}});
        }
    },

    gameUpdatePlayerWinner: function(game) {
        if(game.playerOne.score == game.playerTwo.score) {
            // nothing
        } else if(game.playerOne.score > game.playerTwo.score) {
            Games.update(game._id, {$set: {"playerOne.winner": true}});
        } else if(game.playerTwo.score > game.playerOne.score) {
            Games.update(game._id, {$set: {"playerTwo.winner": true}});
        }
        return true;
    },
});