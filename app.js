var builder = require('botbuilder');
var restify = require('restify');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MY_APP_ID,
    appPassword: process.env.MY_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

var intents = new builder.IntentDialog();
bot.dialog('/', intents);


intents.matches(/^new/i, [
    function (session) {
        session.userData.lives = 5;
        session.userData.word = "hello world";
        session.userData.masked = "XXXXX XXXXX";
        session.beginDialog('/guess');
    }
]);

intents.onDefault([
    function (session) {
        session.beginDialog('/welcome');
    }
]);



bot.dialog('/guess', [
    function (session) {
        session.send('You have ' + session.userData.lives + ' lives left');
        builder.Prompts.text(session, session.userData.masked);
    },
    function (session, results) {
        if(results.response.length > 1)
        {
            if(results.response === session.userData.word)
            {
                session.userData.masked = session.userData.word;
                session.beginDialog('/win');
            }
            else
            {
                session.userData.lives--;
                if(session.userData.lives === 0)
                {
                    session.beginDialog('/gameover');
                }
                else
                {
                    session.beginDialog('/guess');
                }
            }
        }
        else
        {
            session.userData.letter = results.response;
            var wordLength = session.userData.word.length;
            maskedWord = "";
            var found = false;
            for(var i = 0; i < wordLength; i++)
            {
                var letter = session.userData.word[i];
                if(letter === results.response)
                {
                    maskedWord += letter;
                    found = true;
                }
                else
                {
                    maskedWord += session.userData.masked[i];
                }
            }
            session.userData.masked = maskedWord;
            
            if(found === false)
            {
                session.userData.lives--;
            }

            if(session.userData.masked == session.userData.word)
            {
                session.beginDialog('/win');
            }
            else
            {
                if(session.userData.lives === 0)
                {
                    session.beginDialog('/gameover');
                }
                else
                {
                    session.beginDialog('/guess');
                }
            }
        }        
    }
]);

bot.dialog('/win', [
    function (session) {
        session.send(session.userData.masked);
        session.send('Well done, you win!');
        session.endDialog();
    }
]);

bot.dialog('/welcome', [
    function (session) {
        session.send("Hi I'm Hangman Bot. Type 'new' to start a new game.");
        session.endDialog();
    }
]);

bot.dialog('/gameover', [
    function (session) {
        session.send('Game Over! You lose!');
        session.send(session.userData.word);
        session.endDialog();
    }
]);