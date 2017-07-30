import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import '../imports/startup/routes.js';
import 'font-awesome/css/font-awesome.css';

import '../imports/pages/body.js';
import '../imports/startup/accounts-config.js';
import '../imports/api/messages.js';
import '../imports/pages/message';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';


import { Gruppen } from '../imports/api/messages.js';
import { TempBilder } from '../imports/api/messages.js';
import { Bilder } from '../imports/api/messages.js';
import { Tags } from '../imports/api/messages.js'
import { BilderLokal } from '../imports/api/messages.js';
import { FalscheBilder } from '../imports/api/messages.js';
import { AndereBilder } from '../imports/api/messages.js';

//vpn Sunny
import '../imports/api/miniGame.js';
import lightGallery from 'lightgallery';
import jQuery from 'jquery';
import 'lightgallery/dist/css/lightgallery.css';
import 'jquery/dist/jquery.min.js'
import 'lightgallery/dist/js/lightgallery.min.js';

/* Plugins für LightGallery*/
import 'lg-zoom/dist/lg-zoom.js';

handler_bilder = Meteor.subscribe('bilder')
handler_user = Meteor.subscribe('userStatus')
handler_gruppen = Meteor.subscribe('userGruppen')
//ein paar allgemeine Funktionen

function f_meineGruppe (){
	return Gruppen.findOne({"nutzer": Meteor.user().username}).Gruppe;
}

function f_seineGruppe (x){
	return Gruppen.findOne({"nutzer": x}).Gruppe
}


Template.body.helpers({
	actual_user(){
		return Meteor.user().username;
	}
})

Template.userList.helpers({
  usersOnline:function(){
    return Meteor.users.find({ "status.online": true , "username":{$ne: Meteor.user().username}})
  },

  inmygroup:function(x){
	var y = f_seineGruppe(x);
	var y2 = f_meineGruppe();
  	return y==y2
  },
})

Template.userList.events({
	'click .user_online_einladen': function(event){
	//verhindert neu laden der seite
    event.preventDefault();
    //var getnam= event.target.name;
    //console.log(getnam);

	var getUser = event.target.value;
	var now = f_meineGruppe();	Gruppen.insert({
		Gruppe:now,
		nutzer: getUser,
		ready: false,
		tager: false,
		route31: false,
		auswahl: "",
	});
	return false;
   },

})

Template.group.helpers({
	groupname:function(){
		 return Gruppen.find({"nutzer": Meteor.user().username},{nutzer:0, _id:0} );	 
	},

	notgroupmember:function(){
		return Meteor.users.find({ "status.online": true , "username":{$ne: Meteor.user().username}})
	}

})

Template.newgrouptemp.events({
	'submit .new-gruppe'(event){
		event.preventDefault();

		const target = event.target;
		const text = target.text.value;

		Gruppen.insert({
			Gruppe : text,
			nutzer: Meteor.user().username,
			ready: false,  
			tager: false,
			route31: false,
			auswahl: "", 
		})

		target.text.value ='';

	},
	//Bereit button für Spielstart:
	'submit .rdy'(event) {
		event.preventDefault();
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		btn = document.getElementsByClassName("rdy");
		ready = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":0, "ready": 1})[0].ready;

		if (ready) {
			//war bereits Bereit -> nicht mehr Bereit
			Gruppen.update({ _id :id}, {$set: {ready : false}});
			btn[0].style.backgroundColor = "grey";
		} else {
			//noch nicht Bereit -> wird jetzt Bereit
			Gruppen.update({ _id : id}, {$set: {ready : true}});
			btn[0].style.backgroundColor = "green";
			//Auf TempBilder lauschen um das Routing zu ermöglichen
			const query = TempBilder.find();
			Tracker.autorun(() => {
				handler = Meteor.subscribe('spielStart',f_meineGruppe(), {
					onReady: function() {
						const result = Meteor.call('bereit', f_meineGruppe());
					}
				});
			});
			//handler für das Routing
			const handle = query.observeChanges({
				//Der Gruppeneintrag in TempBilder wurde geändert:
				changed: function(id, fields) {
					//Testen ob Routing freigegeben ist
					if (TempBilder.findOne().clear) {
						//Routing ist freigegeben -> Testen zu welcher Seite geroutet werden soll
						if (TempBilder.findOne().route1) {
							//Route1 -> Runde startet
							if (Gruppen.findOne({"nutzer": Meteor.user().username}).tager ) {
								// Spieler ist Tagger
								// Felder zu koordination des Routings werden zurückgesetzt
								id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;	
								Gruppen.update({ _id :id}, {$set: {route31 : false}});	
								Gruppen.update({ _id :id}, {$set: {ready : false}});
								//Spieler wird weitergeleitet
								FlowRouter.go('spielTager');
							} else {
								//Spieler ist Rater
								// Felder zu koordination des Routings werden zurückgesetzt
								id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;	
								Gruppen.update({ _id :id}, {$set: {route31 : false}});	
								Gruppen.update({ _id :id}, {$set: {ready : false}});
								//Spieler wird weitergeleitet
								FlowRouter.go('spiel'); 
							}
						}	else if (TempBilder.findOne().route2) {
							//Route2 -> Runde zuende
							// Felder zu koordination des Routings werden zurückgesetzt
							id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
							Gruppen.update({ _id :id}, {$set: {route31 : true}});
							//Spieler wird weitergeleitet
							FlowRouter.go('Ergebnis'); 						
						}
					}	
				},
				// Der Gruppeneintrag wurde neu erstellt
				added: function(id, fields) {
					//Testen ob Routing freigegeben ist
					if (TempBilder.findOne().clear) {
						//Routing ist freigegeben -> Testen zu welcher Seite geroutet werden soll
						if (TempBilder.findOne().route1) {
							//Route1 -> Runde startet
							if (Gruppen.findOne({"nutzer": Meteor.user().username}).tager) {
								// Spieler ist Tagger
								// Felder zu koordination des Routings werden zurückgesetzt
								id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
								Gruppen.update({ _id :id}, {$set: {route31 : false}});		
								Gruppen.update({ _id :id}, {$set: {ready : false}});
								//Spieler wird weitergeleitet 
								FlowRouter.go('spielTager');  
							} else {
								//Spieler ist Rater
								// Felder zu koordination des Routings werden zurückgesetzt
								id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;		
								Gruppen.update({ _id :id}, {$set: {ready : false}});
								Gruppen.update({ _id :id}, {$set: {route31 : false}});
								//Spieler wird weitergeleitet
								FlowRouter.go('spiel'); 
							}
						}	else if (TempBilder.findOne().route2) {
							//Route2 -> Runde zuende
							// Felder zu koordination des Routings werden zurückgesetzt
							id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
							Gruppen.update({ _id :id}, {$set: {route31 : false}});
							//Spieler wird weitergeleitet
							FlowRouter.go('Ergebnis'); 					
						}	
					}
				}
			});
		}
	},

	'submit .leavegroup':function(event){
		event.preventDefault();
		Meteor.call('gruppeverlassen', Meteor.user().username);
	}

}),

Template.newgrouptemp.helpers({
	

	ingroup:function(){
		return Gruppen.find({"nutzer": {$in: [Meteor.user().username]}  }).count()>0
	},

	groupname:function(){
		return f_meineGruppe();
	},

	groupmember:function(){
		var x = f_meineGruppe();
		return Gruppen.find({"Gruppe": x})
	}
})

Template.raten.helpers({
	//Helfer für die Liste der Tags:
	TagsListe: function(){
		//Subscribed der Liste
		handler_tags = Meteor.subscribe('tagsBild', f_meineGruppe());
		return Tags.find();
	},

	//Helfer um die Bilder anzuzeigen:
	showPics: function() {
		//
/** noch zu testen: ob gebraucht:
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {ready : false }}); */

		//Verweise zu den Bildern für diese Runde:
		zeiger = TempBilder.findOne();
		//temporäre Collection für die Bilder
		merke = new Mongo.Collection();

		//Fülle Collection mithilfe der Verweise aus TempBilder und Bildercollection BilderLokal
		pic = BilderLokal.findOne({_id : zeiger.Bild0});
		merke.insert({_id : zeiger.Bild0,"Url" :pic.Url, "Nummer" : "0" });

		pic = BilderLokal.findOne({_id : zeiger.Bild1});
		merke.insert({_id : zeiger.Bild1,"Url" :pic.Url, "Nummer" : "1" });

		pic = BilderLokal.findOne({_id : zeiger.Bild2});
		merke.insert({_id : zeiger.Bild2,"Url" :pic.Url, "Nummer" : "2" });

		pic = BilderLokal.findOne({_id : zeiger.Bild3});
		merke.insert({_id : zeiger.Bild3,"Url" :pic.Url, "Nummer" : "3" });

		pic = BilderLokal.findOne({_id : zeiger.Bild4});
		merke.insert({_id : zeiger.Bild4,"Url" :pic.Url, "Nummer" : "4" });

		pic = BilderLokal.findOne({_id : zeiger.Bild5});
		merke.insert({_id : zeiger.Bild5,"Url" :pic.Url, "Nummer" : "5" });

		pic = BilderLokal.findOne({_id : zeiger.Bild6});
		merke.insert({_id : zeiger.Bild6,"Url" :pic.Url, "Nummer" : "6" });

		pic = BilderLokal.findOne({_id : zeiger.Bild7});
		merke.insert({_id : zeiger.Bild7,"Url" :pic.Url, "Nummer" : "7" });

		return merke.find();
	},

	//Helfer um als falsch markierte Bilder zu sehen
	subscribenFalsch: function() {
		//Subscribe der Collection mit den markierten Bildern
		handler = Meteor.subscribe('falscheBilder',f_meineGruppe());
		queryWrong = FalscheBilder.find();
		//Handler um auf Änderungen zu lauschen
		const handleWrong = queryWrong.observeChanges({
				//Ein Eintrag wurde geändert:
				//kann vermutlich raus! Testen:
				changed: function(id, fields) {
					zeiger = FalscheBilder.find().fetch({"_id" : 0, "Bild" :1});
					for (var i = 0; i < zeiger.length; i++) {
						x = document.getElementById(zeiger[i].Bild);
						x.style.outlineColor = "red";
					}
				},
				//Ein Bild wurde neu markiert:
				added: function(id, fields) {
					zeiger = FalscheBilder.find().fetch({"_id" : 0, "Bild" :1});
					//Markiere alle Bilder aus der Collection 
					for (var i = 0; i < zeiger.length; i++) {
						x = document.getElementById(zeiger[i].Bild);
						x.style.outlineColor = "red";
					}
				},
				//Eine Markierung wurde entfernt:
				removed: function(id) {
					test = false;
					zeiger = FalscheBilder.find().fetch({"_id" : 0, "Bild" :1});
					y = document.getElementsByClassName("bild");
					//Schleife über die 8 Bilder
					for (j=0; j< y.length; j++) {
						if (y[j].style.outlineColor == "red") {
							//Bild ist markiert -> Überprüfe ob Markierung noch in der Liste
							for (var i = 0; i < zeiger.length; i++) {								
								if(y[j].id == zeiger[i].Bild) {
									//Markierung ist noch in der Liste
									test = true;
								}
							}
							if (!test) {
								//Entferne Markierung, da nicht mehr in der Liste
								y[j].style.outlineColor = "black";
							} else {
								//Markierung ist noch aktuell
								test = false
							}

						}
					}
				},
			});
	},

	//Helfer um die von anderen ausgewählten Bilder zu anzuzeigen
	subscribenAndere: function() {
		//Subscribe der Collection für ausgewählte Bilder
		queryAndere = AndereBilder.find();
		handler_andere = Meteor.subscribe('andereBilder',f_meineGruppe());
		//Handler um auf Änderungen bei der Auswahl zu lauschen
		const handlerAndere = queryAndere.observeChanges({
				//Ein Spieler hat seine Auswahl geändert:
				changed: function(id, fields) {
					test = false;
					zeigerAndere = AndereBilder.find().fetch({"_id" : 0, "User" : 1, "Bild" : 1});
					y = document.getElementsByClassName("bild");
					//Überprüfe alle 8 Bilder
					for (j = 0; j < y.length; j ++) {
						//Test ob man selber das Bild markiert hat
						if (y[j].style.borderColor != "blue") {
							//Gehe die Liste mit den ausgewählten Bildern durch
							for (i = 0; i < zeigerAndere.length; i++ ) {
								//Eigene Auswahl wird übersprungen
								if (zeigerAndere[i].User !=  Meteor.user().username) {
									if (y[j].id == zeigerAndere[i].Bild) {
										//Bild ist noch von jemandem ausgewählt
										test = true;
										//markiere Bild (falls es das geänderte Bild ist)
										y[j].style.borderColor = "yellow";
									}
									if (!test) {
										//Bild ist von keinem ausgewählt -> Keine Markierung 
										y[j].style.borderColor = "black";
									} else {
										//Bild ist noch von jemandem ausgewählt
										test = false;
									}
								}
							}
						}
					}
					
				},
				//Ein Spieler hat sein erstes Bild ausgewählt
				added: function(id, fields) {
					zeigerAndere = AndereBilder.find().fetch({"_id" : 0, "User" : 1, "Bild" : 1});
					//Schleife über alle ausgewählten Bilder
					for (var i = 0; i < zeigerAndere.length; i++) {
						//Überspringe selbst ausgewähltes Bild
						if (zeigerAndere[i].User !=  Meteor.user().username ) {
							// Markiere ausgewähltes Bild
							x = document.getElementById(zeigerAndere[i].Bild);
							x.style.borderColor = "yellow";
						}
					}
				},
			});
	}
})

Template.raten.events({
	//markiere Bild als Falsch:
	'click .bild': function(event) {
		event.preventDefault();
		x = document.getElementById(this._id);
		//Bild wird vom Server in Liste eingetragen	
		queryWrong = FalscheBilder.find();
		Tracker.autorun(() => {
			const resultFalsch = Meteor.apply('falsch', [f_meineGruppe(), this._id]);
		});


	},

	//Wähle Bild aus:
	'dblclick .bild': function(event){
		event.preventDefault();
		x = document.getElementById(this._id);
		y = document.getElementsByClassName("bild");

		//entfernt die (eigene) Markierung von anderen Bildern (falls vorhanden)
		for (i=0; i< y.length; i++) {
			if (y[i].style.borderColor== "blue") {
				y[i].style.borderColor= "black";
			}
		}
		
		//markiert ausgewähltes Bild
		x.style.borderColor = "blue";

		//sagt dem Server welches Bild ausgewählt wurde
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {auswahl : this._id}});
		const resultAndere = Meteor.apply('auswaehlen', [this._id, f_meineGruppe(), Meteor.user().username],{
			onResultReceived: function() {
				handler = Meteor.subscribe('spielStart',f_meineGruppe(), {
				});
			}
		});
		
	},

	

})

Template.taggen.helpers({
	//Helfer für die Liste mit Tags
	TagsListe: function(){
		//Subscribed der Liste
		handler_tags = Meteor.subscribe('tagsBild', f_meineGruppe());
		return Tags.find();
	},

	//Helfer um das zu taggende Bild anzuzeigen:
	showPic: function() {
	/** testen: vermutlich nicht benötigt
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {ready : false }}); */

		//mithilfe des Verweises aus TempBild wird das entsprechende Bild aus der Bilder Collection herausgesucht
		zeiger = TempBilder.findOne();
		pic = BilderLokal.findOne({_id : zeiger.richtig});
		return {id : zeiger.richtig,"Url" :pic.Url };
	}
})

Template.taggen.events({
	// Button um die Tags einzugeben
	'submit .new-tag'(event){
		event.preventDefault();
		//Tags auslesen
		const target = event.target;
		const text = target.text.value;
		//Tags über den Server in der vorübergehenden Tag Collection speichern
		Meteor.call('insertTag', f_meineGruppe(), text);
		//Textfeld leeren
		target.text.value ='';
	}	
})

Template.zwischenErgebnis.helpers({
	//Funktion um die Collections auf den aktuellen Stand zu bringen:
	clearRound: function() {
		//Die Felder zur Koordination des Routings werden auf den richtigen Stand gebracht
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {tager : false }});
		Gruppen.update({ _id : id}, {$set: {ready : false }});
		//ruft die clearRound funktion auf dem Server auf
		Meteor.call('clearRound', f_meineGruppe());
	},

//Funktionen um Inhalte in die Ergebnisseite einzufügen:
	//gibt den Gruppennamen zurück
	gruppeFinden:function(){
		//setzt die Auswahl des Spielers zurück
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {auswahl : ""}});
		return f_meineGruppe();
	},

	//gibt die Anzahl der bereits gespielten Runden zurück
	rundeFinden:function(){
		Meteor.subscribe('spielStart',f_meineGruppe());
		return  TempBilder.findOne().round;
	},

	//gibt die Anzahl der erspielten Punkte zurück
	scoreFinden:function(){
		Meteor.subscribe('spielStart',f_meineGruppe());
		return  TempBilder.findOne().score;
	},

	//Gibt an ob das Bild erraten wurde
	bildRichtig: function() {
		return TempBilder.findOne().auswahl;
	},

	//Gibt das von den Spielern ausgewählte Bild zurück
	showPicAuswahl: function() {
		zeiger1 = TempBilder.findOne();
		auswahl = BilderLokal.findOne({_id : zeiger.auswahlPic });
		return {id : zeiger.auswahlPic, "Url" : auswahl.Url };

	},

	//Gibt das zu erratende Bild zurück
	showPicRichtig: function() {
		zeiger = TempBilder.findOne();
		pic = BilderLokal.findOne({_id : zeiger.richtig});
		return {id : zeiger.richtig,"Url" : pic.Url };
	},

	//Gibt die eingegebenen Tags aus
	findTags: function() {
		handler_tags = Meteor.subscribe('tagsBild', f_meineGruppe());
		return Tags.find();
	}


})

Template.zwischenErgebnis.events({
	//Button um auf die Startseite zu kommen
	'submit .rdy'(event) {
		event.preventDefault();
		//Setzt die Felder für die Koordination des Routings zurück
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id :id}, {$set: {route31 : false}});
		//Setzt die Felder für den Spieler in der Gruppencollection zurück
		name = f_meineGruppe();
		Gruppen.update({_id: id}, {$set: {"Gruppe": name, nutzer: Meteor.user().username,ready: false, tager: false,auswahl: ""}});
		//Leitet den Spieler auf die Startseite zurück
		location.replace('start');
	},
/**
	'submit .weiter'(event) {
		event.preventDefault();
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		btn = document.getElementsByClassName("weiter");
		ready = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":0, "ready": 1})[0].ready;
		Gruppen.update({ _id :id}, {$set: {route31 : false}});
		if (ready) {
			Gruppen.update({ _id : id}, {$set: {ready : false}});
			btn[0].style.backgroundColor = "grey";
		} else {
			Gruppen.update({ _id : id}, {$set: {ready : true}});
			btn[0].style.backgroundColor = "green";
			console.log("test1");

			Tracker.autorun(() => {
				handler = Meteor.subscribe('spielStart',f_meineGruppe());
				if (handler.ready()) {
					const result = Meteor.call('bereit', f_meineGruppe());
				}
			});

		} 

	},*/
})
