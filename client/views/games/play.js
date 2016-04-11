

// Helpers
Template.gamesPlay.helpers({
    game: function() {
        return Games.findOne({_id: Session.get('gameId')});
    },

    winnerName: function() {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(game.playerOne.score > game.playerTwo.score) {
                return 'Winner: '+game.playerOne.name;
            } else if(game.playerTwo.score > game.playerOne.score) {
                return 'Winner: '+game.playerTwo.name;
            } else {
                return "Game draw";
            }
        }
        return '';
    },
    
    playerOneSelectionText: function() {
        var playerOneSelectionText = '?';
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game && typeof game.sets !== 'undefined' && typeof game.sets[game.current.set - 1] !== 'undefined') {
            if(typeof game.sets[game.current.set - 1].playerOneSelection !== 'undefined') {
                return game.sets[game.current.set - 1].playerOneSelection;
            }
        }
        return playerOneSelectionText;
    },
    playerTwoSelectionText: function() {
        var playerOneSelectionText = '?';
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game && typeof game.sets !== 'undefined' && typeof game.sets[game.current.set - 1] !== 'undefined') {
            if(typeof game.sets[game.current.set - 1].playerTwoSelection !== 'undefined') {
                return game.sets[game.current.set - 1].playerTwoSelection;
            }
        }
        return playerOneSelectionText;
    },

    currentlySelected: function() {
        var currentlySelected = '';
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game && typeof game.sets !== 'undefined' && typeof game.sets[game.current.set] !== 'undefined') {
            if(game.playerOne.id === Meteor.userId() && typeof game.sets[game.current.set].playerOneSelection !== 'undefined') {
                return game.sets[game.current.set].playerOneSelection;
            } else if(game.playerTwo.id === Meteor.userId() && typeof game.sets[game.current.set].playerTwoSelection !== 'undefined') {
                return game.sets[game.current.set].playerTwoSelection;
            }
        }
        return currentlySelected;
    },

});

// Events
Template.gamesPlay.events({

    // Set ready and start game
    'click .button-ready': function (event, template) {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            var isPlayerOne = false;
            if(Meteor.userId() === game.playerOne.id) {
                isPlayerOne = true;
            }
            Meteor.call('gameUpdatePlayerReady', game._id, isPlayerOne, function (error, response) {
                console.log('gameUpdatePlayerReady');
                if(!error) {
                    template.$('.button-ready').hide();

                    game = Games.findOne({_id: Session.get('gameId')});

                    if(game.playerOne.ready && game.playerTwo.ready) {

                        // update which player is winning
                        Meteor.call('gameUpdateIsPlaying', game._id, function (error, response) {
                            console.log('gameUpdateIsPlaying');
                            if (!error) {
                                console.log("updating success!");
                            }else{
                                console.log("updating error!" + error);
                            }
                        });
                    }
                }
            });
        }
    },

    // select object
    'click .button-game': function(event, template) {
        var game = Games.findOne({_id: Session.get('gameId')});
        if(game) {
            if(
                (typeof game.sets !== 'undefined' && typeof game.sets[game.current.set] !== 'undefined')
                &&
                (
                    (game.playerOne.id === Meteor.userId() && typeof game.sets[game.current.set].playerOneSelection !== 'undefined')
                    ||
                    (game.playerTwo.id === Meteor.userId() && typeof game.sets[game.current.set].playerTwoSelection !== 'undefined')
                    )
                ) {
                return false;
        }
        var currentSet = game.current.set;
        var selection = template.$(event.currentTarget).attr('selection');

        template.$(event.currentTarget).addClass('opacity-2');

        Meteor.call('gameAddSet', game, selection, function (error, responseGameAddSet) {
            console.log('gameAddSet');
            if (!error) {
                if(game.bestOf !== 0 && responseGameAddSet.updateCurrentSet === game.bestOf) {

                        // finish game
                        Meteor.call('gameUpdateIsCompletedAndIsPlaying', game._id, function (error, responseGameUpdateIsCompletedAndIsPlaying) {
                            console.log('gameUpdateIsCompletedAndIsPlaying');
                            if (error) {
                                alert(error.reason);
                            }
                        });
                    } else {
                        if (responseGameAddSet.updateCurrentSet != currentSet) {
                            $('.button-game').removeClass('opacity-2');

                            game = Games.findOne({_id: Session.get('gameId')});

                            // update which player is winning
                            Meteor.call('gameUpdatePlayerWinner', game, function(error, response) {
                                console.log('gameUpdatePlayerWinner');
                            });
                        }
                    }
                }
            });
    }
},
});

// On Render
Template.gamesPlay.rendered = function () {
    var userId = Meteor.userId();
    var game = Games.findOne({_id: Session.get('gameId')});
    if(game) {
        if((game.playerOne.id !== userId) && game.is.completed === false && game.is.playing !== true) {

            // Player joined
            Meteor.call('gameUpdatePlayerTwo', game._id, function (error, response) {
                console.log('gameUpdatePlayerTwo');
                if (error) {
                    console.log(error);
                }
            });
        }
    }
};
