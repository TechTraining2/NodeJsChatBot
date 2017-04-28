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
        session.userData.word = "hello world";
        session.userData.masked = "XXXXX XXXXX";
        session.beginDialog('/guess');
    }
]);


bot.dialog('/guess', [
    function (session) {
        builder.Prompts.text(session, session.userData.masked);
    },
    function (session, results) {
        session.userData.letter = results.response;
        var wordLength = session.userData.word.length;
        maskedWord = "";
        for(var i = 0; i < wordLength; i++)
        {
            var letter = session.userData.word[i];
            if(letter === results.response)
            {
                maskedWord += letter;
            }
            else
            {
                maskedWord += session.userData.masked[i];
            }
        }
        session.userData.masked = maskedWord;
        if(session.userData.masked == session.userData.word)
        {
            session.beginDialog('/win');
        }
        else
        {
            session.beginDialog('/guess');
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
