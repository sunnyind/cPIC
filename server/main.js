import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Messages } from '../imports/api/messages.js';
import { Gruppen } from '../imports/api/messages.js';
import { TempBilder } from '../imports/api/messages.js';
import '../imports/api/messages.js';

// Hilfsfunktionen:

//Zufallszahlen erzeugen:
function randNumber(min, max) {
	return Math.floor( Random.fraction() * (max-min+1))+min;
};

//zufällige Bilder auswählen:
function randBilder(){
	zeiger = Bilder.find().fetch();
	
	randPics = new Mongo.Collection();
	var rand = 0;
	var max = Bilder.find().count()-1; // Anzahl Bilder in db

	for (i = 0; i< 8; i++) {
		// random Zahl zwischen 1 und Anzahl Bilder:
		rand = randNumber(0,max); 
		//zufälliges Bild:
		merke = zeiger[rand];
		//Bild bereits in Collection?
		if (randPics.find({_id: zeiger[rand]._id}).count() > 0) { 
			i--;
		} else {
			randPics.insert(zeiger[rand]);
		}

	}
	return randPics.find().fetch();
};

Meteor.methods({
	bereit(gruppenName) {

//		id = TempBilder.find({"Gruppe": gruppenName}).fetch({"_id":1})[0]._id;
		zaehle = Gruppen.find({"Gruppe" : gruppenName, "ready" : false}).count();
		anzahl = Gruppen.find({"Gruppe" : gruppenName}).count();
		if(anzahl > 1 && zaehle == 0) {
			pics = randBilder();
		TempBilder.insert({"Gruppe": gruppenName, "Bilder" : pics });
		}
		
	}
});

Gruppen.allow({
	insert(userId, doc) {
		return true;
	},

	update(userId, doc, fieldNames, modifier) {
		return true;
	},

	fetch: ['owner']
});


Meteor.publish("userStatus", function() {
  return Meteor.users.find({ "status.online": true });
});

Meteor.publish("userGruppen", function() {
	return Gruppen.find();
});

Meteor.publish("userMessages", function(){
	 return Messages.find();
});

Meteor.publish("spielStart", function(gruppenName) {
	return TempBilder.find({"Gruppe": gruppenName});
});

Meteor.startup(() => {
  // code to run on server at startup
});
