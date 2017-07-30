import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { Tags } from '../imports/api/messages.js'
import { Bilder } from '../imports/api/messages.js'
import { Messages } from '../imports/api/messages.js';
import { Gruppen } from '../imports/api/messages.js';
import { TempBilder } from '../imports/api/messages.js';
import { BilderLokal } from '../imports/api/messages.js';
import { FalscheBilder } from '../imports/api/messages.js';
import { AndereBilder } from '../imports/api/messages.js';
import { BilderTags } from '../imports/api/messages.js';

import '../imports/api/messages.js';
import '../imports/api/miniGame.js';


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
	//Runde zuende -> Datenbanken auf den richtigen Stand für neue Runde bringen:
	clearRound(gruppenName) {
		//Testen ob alle Gruppenmitglieder bereits auf der Ergebnisseite sind
		if (Gruppen.find({"Gruppe": gruppenName, route31: true}).count() == Gruppen.find({"Gruppe": gruppenName}).count()) {
			//Routing zurücksetzten
			id = TempBilder.find({"Gruppe": gruppenName}).fetch({_id:1})[0]._id;
			TempBilder.update({_id : id}, {$set: { route2 : false} });
			//Wenn das Bild erraten wurde, Tags speichern
			if (TempBilder.find({"Gruppe": gruppenName}).fetch({_id:1,auswahl:1})[0].auswahl) {
				bild = TempBilder.find({"Gruppe": gruppenName}).fetch({_id:0,richtig:1})[0].richtig;
				zeiger = Tags.find({"Gruppe" : gruppenName}).fetch();
				for (i = 0; i < zeiger.length; i++) {
					if (BilderTags.find({"Bild" : bild, "Tag" : zeiger[i].Tag}).count() == 0) {
						BilderTags.insert({"Bild" : bild, "Tag" : zeiger[i].Tag});
					}
				}
			}

		}
		//Die Markierungen der Bilder löschen
		AndereBilder.remove({"Gruppe" : gruppenName});
		FalscheBilder.remove({"Gruppe" : gruppenName});
	},
	
	//Vom Tagger eingegebene Tags in vorläufiger DB speichern 
	insertTag(gruppenName,tag) {
		Tags.insert({"Gruppe": gruppenName, Tag: tag});
	},

	//Spielstart
	bereit(gruppenName) {
		var zaehle = Gruppen.find({"Gruppe" : gruppenName, "ready" : false}).count();
		var anzahl = Gruppen.find({"Gruppe" : gruppenName}).count();
		//Teste ob alle bereit sind:
		if(anzahl > 1 && zaehle == 0) {
			//stelle sicher, dass alle dbs auf richtigem Stand:
			Tags.remove({"Gruppe": gruppenName});

		//neue Runde vorbereiten  bzw. nächste Runde vorbereiten (TempBilder auf den richtigen Stand bringen)
		if (TempBilder.find({"Gruppe" : gruppenName}).count() == 0) {
				TempBilder.insert({"Gruppe": gruppenName, auswahl : false , route1 : false, route2 : false, clear : false, score : 0, round : 1, auswahlPic : "", scoreInc : false});	
			} else {
				id = TempBilder.find({"Gruppe": gruppenName}).fetch({_id:1})[0]._id;
				TempBilder.update({_id : id}, {$set: { clear : false } });   //Routing blockieren
				TempBilder.update({_id : id}, {$set: { auswahl : false } }); 
				TempBilder.update({_id : id}, {$set: { route1 : false } });	
				TempBilder.update({_id : id}, {$set: { route2 : false } });	
				TempBilder.update({_id : id}, {$inc: { round : 1 } });	//Rundenanzahl erhöhen
				TempBilder.update({_id : id}, {$set: { auswahlPic : "" } });
				TempBilder.update({_id : id}, {$set: { scoreInc : false } });
				

			}
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
			//Routing vorbereiten
			TempBilder.update({_id : id}, {$set: { route1 : true} });
			//Routing freigeben:
			TempBilder.update({_id : id}, {$set: { clear : true } });
		}
		
	},

	//Bilder erraten(Spielablauf):	
	auswaehlen(wahl,gruppenName, username) {
		//Den Spielern zeigen, welche Bilder von anderen Spielern ausgewählt wurden:
		if(AndereBilder.find({"Gruppe" : gruppenName, "User" : username}).count()==0 ) {
			//Der Spieler hat noch kein Bild ausgewählt -> Auswahl speichern
			AndereBilder.insert({"Gruppe" : gruppenName, "User" : username, "Bild" : wahl});
		} else {
			//Der Spieler hat bereits ein Bild ausgewählt -> Auswahl ändern
			id = AndereBilder.find({"Gruppe": gruppenName, "User" : username}).fetch({_id:1})[0]._id;
			AndereBilder.update({_id : id}, {$set: { "Bild" : wahl}});

		}

		id = TempBilder.find({"Gruppe": gruppenName}).fetch({_id:1})[0]._id;
		//Routing blockieren
		TempBilder.update({_id : id}, {$set: { clear : false } });
		//Falsches Routing verhindern:
		TempBilder.update({_id : id}, {$set: { route1 : false } });

		zaehle = Gruppen.find({"Gruppe" : gruppenName, "auswahl" : wahl}).count();
		anzahl = Gruppen.find({"Gruppe" : gruppenName}).count() - 1;

		id = TempBilder.find({"Gruppe": gruppenName}).fetch({_id:1})[0]._id;
		
		//Testen ob aller Spieler dasselbe Bild ausgewählt haben
		if (zaehle == anzahl) {
			zeiger = TempBilder.findOne({"Gruppe" : gruppenName});
			//Ausgewähltes Bild speichern
			TempBilder.update({_id : id}, {$set: { auswahlPic : wahl}})
			//Testen ob richtiges Bild ausgewählt wurde
			if (TempBilder.find({"Gruppe" : gruppenName, richtig : wahl}).count() > 0) {
				TempBilder.update({_id : id}, {$set: { auswahl : true } });
				//richtiges Bild -> Score erhöhen
				if (!TempBilder.find({"Gruppe": gruppenName}).fetch({_id : 0, scoreInc : 1})[0].scoreInc) {
					TempBilder.update({_id : id}, {$set: { scoreInc : true } });					
					TempBilder.update({_id : id}, {$inc: { score : 1 } });
				}
			}
			//Routing vorbereiten
			TempBilder.update({_id : id}, {$set: { route2 : true } });
			
		}
		//Routing freigeben
		TempBilder.update({_id : id}, {$set: { clear : true } });
		return true;
	},

	//falsche Bilder markieren
	falsch(gruppenName,bildName) {
		if (FalscheBilder.find({"Gruppe" : gruppenName, "Bild" : bildName}).count() == 0) {
			//Bild wurde noch nicht markiert -> Bild wird markiert
			FalscheBilder.insert({"Gruppe" : gruppenName, "Bild" : bildName});
		} else {
			//Bild wurde schon markiert -> Markierung wird aufgehoben
			FalscheBilder.remove({"Gruppe" : gruppenName, "Bild" : bildName});
		}
		return true;
	},
});

//Rechte für die Gruppencollection vergeben:
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

//Collection für den Spielverlauf (Routing, Bilder, Score, Runde ...)
Meteor.publish("spielStart", function(gruppenName) {
	return TempBilder.find({"Gruppe": gruppenName},{fields: { Gruppe : 0}});
});

//Collection mit den Bildern
Meteor.publish("bilder",function() {
	return BilderLokal.find();
});

//Collection um die Tags für die aktuelle Runde zu speichern
Meteor.publish("tagsBild", function(gruppenName) {
	return Tags.find({"Gruppe": gruppenName})
});

//Collection um Bilder als Falsch zu markieren
Meteor.publish("falscheBilder", function(gruppenName) {
	return FalscheBilder.find({"Gruppe": gruppenName})
});

//Collection um die, von anderen Spielern ausgewählten Bilder, anzuzeigen
Meteor.publish("andereBilder", function(gruppenName) {
	return AndereBilder.find({"Gruppe": gruppenName})
});

Meteor.startup(() => {
  // code to run on server at startup

  //Lokale Bilder in DB speichern, falls noch nicht vorhanden
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
