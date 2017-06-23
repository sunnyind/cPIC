import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { Tags } from '../imports/api/messages.js'
import { Bilder } from '../imports/api/messages.js'
import { Messages } from '../imports/api/messages.js';
import { Gruppen } from '../imports/api/messages.js';
import { TempBilder } from '../imports/api/messages.js';
import { BilderLokal } from '../imports/api/messages.js';
import '../imports/api/messages.js';


// Hilfsfunktionen:

//Zufallszahlen erzeugen:
function randNumber(min, max) {
	return Math.floor( Random.fraction() * (max-min+1))+min;
};

//zufällige Bilder auswählen:
function randBilder(){
	zeiger = BilderLokal.find().fetch();
	
	randPics = new Mongo.Collection();
	var rand = 0;
	var max = BilderLokal.find().count()-1; // Anzahl Bilder in db

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
	clearRound(gruppenName) {
		if (Gruppen.find({"Gruppe": gruppenName, route: true}).count() == Gruppen.find({"Gruppe": gruppenName}).count()) {
			id = TempBilder.find({"Gruppe": gruppenName}).fetch({_id:1})[0]._id;
			TempBilder.update({_id : id}, {$set: { route2 : false} });		
		}
	},
	
	insertTag(gruppenName,tag) {
		Tags.insert({"Gruppe": gruppenName, Tag: tag});
	},

	bereit(gruppenName) {
		zaehle = Gruppen.find({"Gruppe" : gruppenName, "ready" : false}).count();
		anzahl = Gruppen.find({"Gruppe" : gruppenName}).count();
		//Teste ob alle bereit sind:
		if(anzahl > 1 && zaehle == 0) {
			//stelle sicher, dass alle dbs auf richtigem Stand:
			Tags.remove({"Gruppe": gruppenName});
			TempBilder.remove({});
			TempBilder.insert({"Gruppe": gruppenName, auswahl : false , route1 : false, route2 : false, route3 : false, score : 0, round : 0});	
/**			if (TempBilder.find({"Gruppe" : gruppenName}).count() == 0) {
				TempBilder.insert({"Gruppe": gruppenName, auswahl : false , route1 : false, route2 : false, route3 : false, score : 0, round : 0});	
			} else {
				id = TempBilder.find({"Gruppe": gruppenName}).fetch({_id:1})[0]._id;
				TempBilder.update({_id : id}, {$set: { route2 : false } });	
				TempBilder.update({_id : id}, {$set: { route3 : false } });
				TempBilder.update({_id : id}, {$set: {auswahl : false } });
				if (TempBilder.find({_id : id, round: {$gt: 4 }}).count() > 0 ){
					TempBilder.update({_id : id}, {$set: {round : 0 } });
				}
			}*/
			//wähle zufällige Bilder:			
			id = TempBilder.find({"Gruppe": gruppenName}).fetch({_id:1})[0]._id;
			pics = randBilder();
			TempBilder.update({_id : id}, {$set: { Bild0 : pics[0]._id} });
			TempBilder.update({_id : id}, {$set: { Bild1 : pics[1]._id} });
			TempBilder.update({_id : id}, {$set: { Bild2 : pics[2]._id} });
			TempBilder.update({_id : id}, {$set: { Bild3 : pics[3]._id} });
			TempBilder.update({_id : id}, {$set: { Bild4 : pics[4]._id} });
			TempBilder.update({_id : id}, {$set: { Bild5 : pics[5]._id} });
			TempBilder.update({_id : id}, {$set: { Bild6 : pics[6]._id} });
			TempBilder.update({_id : id}, {$set: { Bild7 : pics[7]._id} });
			//tager auswählen:
			rand = randNumber(0,anzahl-1);
			grpid = Gruppen.find({"Gruppe" : gruppenName}).fetch({_id:1})[rand]._id;
			Gruppen.update({_id : grpid}, {$set: {tager: true}});
			while (!(Gruppen.find({_id : grpid, tager : true}).count() >0) ) {

			}
			//richtiges Bild auswählen:
			rand = randNumber(0,7);
			TempBilder.update({_id : id}, {$set: {richtig : pics[rand]._id} });
			//sorge für Weiterleitung:
			TempBilder.update({_id : id}, {$set: { route1 : true} });		
			console.log("bereit fertig");
		}
		
	},

	auswaehlen(wahl,gruppenName) {
		console.log("alle");
		//Sobald jemand ein Bild auswählt wird verhindert, dass sofort weitergeroutet wird:
		id = TempBilder.find({"Gruppe": gruppenName}).fetch({_id:1})[0]._id;
		TempBilder.update({_id : id}, {$set: { route1 : false } });

		zaehle = Gruppen.find({"Gruppe" : gruppenName, "auswahl" : wahl}).count();
		anzahl = Gruppen.find({"Gruppe" : gruppenName}).count() - 1;

		id = TempBilder.find({"Gruppe": gruppenName}).fetch({_id:1})[0]._id;
		runde = TempBilder.findOne({_id : id}).round;
		punkte = TempBilder.findOne({_id : id}).score;

		if (zaehle == anzahl) {
			zeiger = TempBilder.findOne({"Gruppe" : gruppenName});
			if (TempBilder.find({"Gruppe" : gruppenName, richtig : wahl}).count() > 0) {
				TempBilder.update({_id : id}, {$set: { auswahl : true } });
				if (punkte == TempBilder.findOne({_id : id}).score) {
					TempBilder.update({_id : id}, {$inc: { score : 1 } });

				}
			}
			if (runde == TempBilder.findOne({_id : id}).round) {
				TempBilder.update({_id : id}, {$inc: { round : 1 } });
			}
			TempBilder.update({_id : id}, {$set: { route2 : true } });
			
		}
		return true;
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



Meteor.methods({
	gruppeverlassen(x){
		Gruppen.remove({"nutzer":x});
	},

	gruppeinladen(us, grup){
		Gruppen.insert({})
	}

});




/*UserStatus.events.on("connectionLogout",function(userId){
	console.log(userId)
	//gruppeverlassen2 ( Meteor.user({"_id":this.userId}).username )
	//var x =Meteor.user({"_id":userId}) 
	Gruppen.remove({"nutzer": userId});

	Meteor.users.find({ "status.online": true }).observeChanges({
  removed(id){
    Gruppe.remove("nutzer": this.username);
  }
});
	
})*/

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
	return TempBilder.find({"Gruppe": gruppenName},{fields: { Gruppe : 0}});
});

Meteor.publish("bilder",function() {
	return BilderLokal.find();
});

Meteor.publish("tagsBild", function(gruppenName) {
	return Tags.find({"Gruppe": gruppenName})
});

Meteor.startup(() => {
  // code to run on server at startup
  if(BilderLokal.find().count() == 0) {
  	lokal = "S06_D01.";
  	pfad = "/Bilder/";
  	for(i = 1; i < 28; i++ ) {
  		if (i<10) {
  			bildUrl =  pfad +lokal + "0" + i +".jpg";
  		} else {
  	  		bildUrl = pfad + lokal + i + ".jpg";
  		}
  		id = bildUrl;
  		collection_id = lokal;
  		BilderLokal.insert({_id : id, "collection_id" : collection_id, "Url": bildUrl});
  	}
  }
});


