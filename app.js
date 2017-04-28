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

var words = ["12 Angry Men","12 Years a Slave","2001 A Space Odyssey","3 Idiots","A Beautiful Mind","A Clockwork Orange","A Separation","A Wednesday","Alien","Aliens","All About Eve","Amadeus","Amelie","American Beauty","American History X","Amores Perros","Andaz Apna Apna","Andrei Rublev","Annie Hall","Apocalypse Now","Back to the Future","Barry Lyndon","Batman Begins","Beauty and the Beast","Before Sunrise","Ben-Hur","Bicycle Thieves","Blade Runner","Braveheart","Butch Cassidy and the Sundance Kid","Casablanca","Casino","Catch Me If You Can","Children of Heaven","Chinatown","Cinema Paradiso","Citizen Kane","City Lights","City of God","Come and See","Cool Hand Luke","Dangal","Das Boot","Diabolique","Dial M for Murder","Die Hard","Django Unchained","Dog Day Afternoon","Donnie Darko","Double Indemnity","Downfall","Dr Strangelove or How I Learned to Stop Worrying and Love the Bomb","Drishyam","Eternal Sunshine of the Spotless Mind","Fargo","Fight Club","Finding Nemo","For a Few Dollars More","Forrest Gump","Full Metal Jacket","Gandhi","Gangs of Wasseypur","Gladiator","Gone Girl","Gone with the Wind","Good Will Hunting","Goodfellas","Gran Torino","Grave of the Fireflies","Groundhog Day","Hachi A Dogs Tale","Hacksaw Ridge","Harry Potter and the Deathly Hallows Part 2","Heat","Hera Pheri","Hotel Rwanda","How to Train Your Dragon","Howls Moving Castle","Ikiru","In the Mood for Love","In the Name of the Father","Incendies","Inception","Indiana Jones and the Last Crusade","Infernal Affairs","Inglourious Basterds","Inside Out","Interstellar","Into the Wild","It Happened One Night","Its a Wonderful Life","Jaws","Judgment at Nuremberg","Jurassic Park","Kill Bill Vol 1","LA Confidential","La Haine","La La Land","Lawrence of Arabia","Léon The Professional","Life Is Beautiful","Life of Brian","Like Stars on Earth","Lock Stock and Two Smoking Barrels","Logan","Mad Max Fury Road","Mary and Max","Memento","Memories of Murder","Metropolis","Million Dollar Baby","Modern Times","Monsters Inc","Monty Python and the Holy Grail","Mr Smith Goes to Washington","Munna Bhai MBBS","My Father and My Son","My Neighbor Totoro","Nausicaä of the Valley of the Wind","Network","No Country for Old Men","North by Northwest","Oldboy","On the Waterfront","Once Upon a Time in America","Once Upon a Time in the West","One Flew Over the Cuckoos Nest","Pans Labyrinth","Paths of Glory","Persona","Pirates of the Caribbean The Curse of the Black Pearl","PK","Platoon","Princess Mononoke","Prisoners","Psycho","Pulp Fiction","Raging Bull","Raiders of the Lost Ark","Ran","Rang De Basanti","Rashomon","Rear Window","Rebecca","Requiem for a Dream","Reservoir Dogs","Rocky","Room","Rush","Saving Private Ryan","Scarface","Schindlers List","Se7en","Seven Samurai","Sholay","Shutter Island","Singin in the Rain","Snatch","Some Like It Hot","Spirited Away","Spotlight","Stalker","Stand by Me","Star Wars Episode IV A New Hope","Star Wars Episode V The Empire Strikes Back","Star Wars Episode VI Return of the Jedi","Star Wars The Force Awakens","Sunrise","Sunset Boulevard","Taxi Driver","Terminator 2 Judgment Day","The 400 Blows","The Apartment","The Bandit","The Battle of Algiers","The Best Years of Our Lives","The Big Lebowski","The Bourne Ultimatum","The Bridge on the River Kwai","The Dark Knight","The Dark Knight Rises","The Deer Hunter","The Departed","The Elephant Man","The General","The Godfather","The Godfather Part II","The Gold Rush","The Good the Bad and the Ugly","The Grand Budapest Hotel","The Grapes of Wrath","The Great Dictator","The Great Escape","The Green Mile","The Help","The Hunt","The Intouchables","The Kid","The Lion King","The Lives of Others","The Lord of the Rings The Fellowship of the Ring","The Lord of the Rings The Return of the King","The Lord of the Rings The Two Towers","The Maltese Falcon","The Matrix","The Nights of Cabiria","The Passion of Joan of Arc","The Pianist","The Prestige","The Princess Bride","The Secret in Their Eyes","The Seventh Seal","The Shawshank Redemption","The Shining","The Silence of the Lambs","The Sixth Sense","The Sting","The Terminator","The Thing","The Third Man","The Treasure of the Sierra Madre","The Truman Show","The Usual Suspects","The Wages of Fear","The Wizard of Oz","The Wolf of Wall Street","There Will Be Blood","To Kill a Mockingbird","Tokyo Story","Touch of Evil","Toy Story","Toy Story 3","Trainspotting","Twelve Monkeys","Unforgiven","Up","V for Vendetta","Vertigo","WALLE","Warrior","What Ever Happened to Baby Jane","Whiplash","Wild Strawberries","Wild Tales","Witness for the Prosecution","Yojimbo","Your Name","Zootopia"];

var intents = new builder.IntentDialog();
bot.dialog('/', intents);


intents.matches(/^new/i, [
    function (session) {
        session.userData.lives = 5;
        session.userData.word = words[Math.floor(Math.random() * words.length)];
        session.userData.masked = session.userData.word.replace(/[A-Z]/ig,'?')
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
        session.send('You have ' + session.userData.lives + ' ' + (session.userData.lives == 1 ? 'life' : 'lives') + ' left');
        builder.Prompts.text(session, session.userData.masked);
    },
    function (session, results) {
        if(results.response.length > 1)
        {
            if(results.response.toUpperCase() === session.userData.word.toUpperCase())
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
                if(letter.toUpperCase() === results.response.toUpperCase())
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