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
	var now = f_meineGruppe();
	console.log (getUser);
	Gruppen.insert({
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

	'submit .rdy'(event) {
		event.preventDefault();
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		btn = document.getElementsByClassName("rdy");
		ready = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":0, "ready": 1})[0].ready;

		if (ready) {
			Gruppen.update({ _id :id}, {$set: {ready : false}});
			btn[0].style.backgroundColor = "grey";
		} else {
			Gruppen.update({ _id : id}, {$set: {ready : true}});
			btn[0].style.backgroundColor = "green";
			const query = TempBilder.find();
			Tracker.autorun(() => {
				handler = Meteor.subscribe('spielStart',f_meineGruppe(), {
					onReady: function() {
						const result = Meteor.call('bereit', f_meineGruppe());
					}
				});
			});
			const handle = query.observeChanges({
				changed: function(id, fields) {
					if (TempBilder.findOne().clear) {
						console.log("changed");
						if (TempBilder.findOne().route1) {
							if (Gruppen.findOne({"nutzer": Meteor.user().username}).tager ) {
								id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;	
								Gruppen.update({ _id :id}, {$set: {route31 : false}});	
								Gruppen.update({ _id :id}, {$set: {ready : false}});
							/**	location.replace('spielTager'); */
								FlowRouter.go('spielTager');
							} else {
								id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;	
								Gruppen.update({ _id :id}, {$set: {route31 : false}});	
								Gruppen.update({ _id :id}, {$set: {ready : false}});
							/**	location.replace('spiel'); */ 
								FlowRouter.go('spiel'); 
							}
						}	else if (TempBilder.findOne().route2) {
						/**	location.replace('Ergebnis'); */
							id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
							Gruppen.update({ _id :id}, {$set: {route31 : true}});
							FlowRouter.go('Ergebnis'); 						
						}
					}	
				},
				added: function(id, fields) {
					console.log("added");
					if (TempBilder.findOne().clear) {
						if (TempBilder.findOne().route1) {
							if (Gruppen.findOne({"nutzer": Meteor.user().username}).tager) {
								id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
								Gruppen.update({ _id :id}, {$set: {route31 : false}});		
								Gruppen.update({ _id :id}, {$set: {ready : false}});
							/**	location.replace('spielTager'); */ 
								FlowRouter.go('spielTager');  
							} else {
								id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;		
								Gruppen.update({ _id :id}, {$set: {ready : false}});
								Gruppen.update({ _id :id}, {$set: {route31 : false}});
							/**	location.replace('spiel'); */
								FlowRouter.go('spiel'); 
							}
						}	else if (TempBilder.findOne().route2) {
							id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
							Gruppen.update({ _id :id}, {$set: {route31 : false}});
						/**	location.replace('Ergebnis'); */
							FlowRouter.go('Ergebnis'); 					
						}	
					}
				}
			});
		}
	},

	'submit .leavegroup':function(event){
		event.preventDefault();
		console.log(Meteor.user().username);
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
	TagsListe: function(){
		handler_tags = Meteor.subscribe('tagsBild', f_meineGruppe());
		return Tags.find();
	},

	showPics: function() {
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {ready : false }});
		zeiger = TempBilder.findOne();
		merke = new Mongo.Collection();

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

		subscriben: function() {

		handler = Meteor.subscribe('falscheBilder',f_meineGruppe());
		queryWrong = FalscheBilder.find();
		console.log("subscribe");
		const handleWrong = queryWrong.observeChanges({
				changed: function(id, fields) {
					zeiger = FalscheBilder.find().fetch({"_id" : 0, "Bild" :1});
					for (var i = 0; i < zeiger.length; i++) {
						x = document.getElementById(zeiger[i].Bild);
						x.style.outlineColor = "red";
					}
				},
				added: function(id, fields) {
					console.log("1");
					zeiger = FalscheBilder.find().fetch({"_id" : 0, "Bild" :1});
					console.log(zeiger);
					for (var i = 0; i < zeiger.length; i++) {
						x = document.getElementById(zeiger[i].Bild);
						console.log(x.style.outlineColor);
						x.style.outlineColor = "red";
					}
				},
				removed: function(id) {
					test = false;
					zeiger = FalscheBilder.find().fetch({"_id" : 0, "Bild" :1});
					y = document.getElementsByClassName("bild");
					for (j=0; j< y.length; j++) {
						if (y[j].style.outlineColor == "red") {
							for (var i = 0; i < zeiger.length; i++) {
								console.log(y[j].id);
								console.log(zeiger[i].Bild);
								if(y[j].id == zeiger[i].Bild) {
									test = true;
								}
							}
							if (!test) {
								y[j].style.outlineColor = "black";
							} else {
								test = false
							}

						}
					}
				},
			});
		console.log("fertig");
	}
})

Template.raten.events({
	'click .bild': function(event) {
		event.preventDefault();
		x = document.getElementById(this._id);

		queryWrong = FalscheBilder.find();
		Tracker.autorun(() => {
			const resultFalsch = Meteor.apply('falsch', [f_meineGruppe(), this._id]);
		});


	},

	'dblclick .bild': function(event){
		event.preventDefault();
		x = document.getElementById(this._id);
		y = document.getElementsByClassName("bild");
		//entfernt die Markierung von anderen Bildern (falls vorhanden)
		for (i=0; i< y.length; i++) {
			if (y[i].style.borderColor== "blue") {
				y[i].style.borderColor= "black";
			}
		}
		x.style.outlineColor = "black";
		//markiert ausgewähltes Bild
		x.style.borderColor = "blue";
		//sagt dem Server welches Bild ausgewählt wurde
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		console.log(this._id);
		Gruppen.update({ _id : id}, {$set: {auswahl : this._id}});

		Tracker.autorun(() => {
			const result = Meteor.apply('auswaehlen', [this._id, f_meineGruppe()],{
				onResultReceived: function() {
					handler = Meteor.subscribe('spielStart',f_meineGruppe(), {
					});
				}
			});
		});
	},

	

})

Template.taggen.helpers({
	TagsListe: function(){
		handler_tags = Meteor.subscribe('tagsBild', f_meineGruppe());
		return Tags.find();
	},

	showPic: function() {
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {ready : false }});

		zeiger = TempBilder.findOne();
		pic = BilderLokal.findOne({_id : zeiger.richtig});
		console.log(zeiger.route2);
		return {id : zeiger.richtig,"Url" :pic.Url };
	}
})

Template.taggen.events({
	'submit .new-tag'(event){
		event.preventDefault();
		const target = event.target;
		const text = target.text.value;
		Meteor.call('insertTag', f_meineGruppe(), text);
		target.text.value ='';
	}	
})

Template.zwischenErgebnis.helpers({
	clearRound: function() {
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {tager : false }});
		Gruppen.update({ _id : id}, {$set: {ready : false }});
		Meteor.call('clearRound', f_meineGruppe());
	},

	gruppeFinden:function(){
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {auswahl : ""}});
		return f_meineGruppe();
	},

	rundeFinden:function(){
		Meteor.subscribe('spielStart',f_meineGruppe());
		return  TempBilder.findOne().round;
	},

	scoreFinden:function(){
		Meteor.subscribe('spielStart',f_meineGruppe());
		return  TempBilder.findOne().score;
	},

	bildRichtig: function() {
		if(TempBilder.findOne().auswahl) {
			return "Richtig!";
		} else {
			return "Falsch!";
		}
	},

	showPicAuswahl: function() {
		zeiger1 = TempBilder.findOne();
		auswahl = BilderLokal.findOne({_id : zeiger.auswahlPic });
		return {id : zeiger.auswahlPic, "Url" : auswahl.Url };

	},

	showPicRichtig: function() {
		zeiger = TempBilder.findOne();
		pic = BilderLokal.findOne({_id : zeiger.richtig});
		return {id : zeiger.richtig,"Url" : pic.Url };
	},

	findTags: function() {
		handler_tags = Meteor.subscribe('tagsBild', f_meineGruppe());
		return Tags.find();
	}


})

Template.zwischenErgebnis.events({
	'submit .rdy'(event) {
		event.preventDefault();
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id :id}, {$set: {route31 : false}});
		name = f_meineGruppe();
		Gruppen.update({_id: id}, {$set: {"Gruppe": name, nutzer: Meteor.user().username,ready: false, tager: false,auswahl: ""}});
		location.replace('start');
	},

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

	},
})