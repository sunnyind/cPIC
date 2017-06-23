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
		route: false,
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
			route: false,
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
					console.log("changed");
					if (TempBilder.findOne().route1) {
						console.log(Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":0,tager:1})[0].tager);
						console.log(Gruppen.findOne({"nutzer": Meteor.user().username}).tager);
						console.log(Meteor.user().username);
						if (Gruppen.find({"nutzer": Meteor.user().username, "tager" : true}).count() > 0 ) {
							id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;		
							Gruppen.update({ _id :id}, {$set: {ready : false}});
							Gruppen.update({ _id :id}, {$set: {route : true}});
							FlowRouter.go('spielTager');
						} else {
							id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;		
							Gruppen.update({ _id :id}, {$set: {ready : false}});
							Gruppen.update({ _id :id}, {$set: {route : true}});
							FlowRouter.go('spiel');
						}
					}	else if (TempBilder.findOne().route2) {
						Gruppen.update({ _id :id}, {$set: {route : false}});
						FlowRouter.go('Ergebnis');						
					}	else if (TempBilder.findOne().route3) {
						Gruppen.update({ _id :id}, {$set: {route : false}});
						FlowRouter.go('start');
					}	
				},
				added: function(id, fields) {
					console.log("added");
					if (TempBilder.findOne().route1) {
						if (Gruppen.findOne({"nutzer": Meteor.user().username}).tager) {
							id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;		
							Gruppen.update({ _id :id}, {$set: {ready : false}});
							FlowRouter.go('spielTager');
						} else {
							id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;		
							Gruppen.update({ _id :id}, {$set: {ready : false}});
							FlowRouter.go('spiel');
						}
					}	else if (TempBilder.findOne().route2) {
						FlowRouter.go('Ergebnis');					
					}	else if (TempBilder.findOne().route3) {
						FlowRouter.go('start');
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
	}



})

Template.raten.events({
	'click .bild': function(event){
		event.preventDefault();
		x = document.getElementById(this._id);
		y = document.getElementsByClassName("bild");
		//entfernt die Markierung von anderen Bildern (falls vorhanden)
		for (i=0; i< y.length; i++) {
			if (y[i].style.borderColor== "blue") {
				y[i].style.borderColor= "grey";
			}
		}
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
	}	 
})

Template.taggen.helpers({
	TagsListe: function(){
		handler_tags = Meteor.subscribe('tagsBild', f_meineGruppe());
		return Tags.find();
	},

	showPic: function() {
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {ready : false }});
		Gruppen.update({ _id : id}, {$set: {tager : false }});

		zeiger = TempBilder.findOne();
		pic = BilderLokal.findOne({_id : zeiger.richtig});
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
	

	gruppeFinden:function(){
		id = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":1})[0]._id;
		Gruppen.update({ _id : id}, {$set: {auswahl : ""}});
		return f_meineGruppe();
	},

	scoreFinden:function(){
		Meteor.subscribe('spielStart',f_meineGruppe());
		return  TempBilder.findOne().score;
	},

	rundenGespielt:function(){
		return TempBilder.findOne().round;
	}, 

	bildRichtig: function() {
		if(TempBilder.findOne().auswahl) {
			return "Richtig!";
		} else {
			return "Falsch!";
		}
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
		btn = document.getElementsByClassName("rdy");
		ready = Gruppen.find({"nutzer": Meteor.user().username}).fetch({"_id":0, "ready": 1})[0].ready;

		if (ready) {
			Gruppen.update({ _id :id}, {$set: {ready : false}});
			btn[0].style.backgroundColor = "grey";
		} else {
			Gruppen.update({ _id : id}, {$set: {ready : true}});
			btn[0].style.backgroundColor = "green";
			console.log("test1");

			Tracker.autorun(() => {
				handler = Meteor.subscribe('spielStart',f_meineGruppe());
				if (handler.ready()) {
					console.log("ready");
					const result = Meteor.call('bereit', f_meineGruppe());
				}
				console.log("test");
			});

		}
	},
})