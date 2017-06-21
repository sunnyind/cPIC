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
    var getnam= event.target.name;
    console.log(getnam);

	var getUser = event.target.value;
	var now = f_meineGruppe();
/*<<<<<<< HEAD
		//Gruppen.find({"nutzer": Meteor.user().username})
	Gruppen.update(
		{"nutzer": nameeinladen},
		{$set: {"Gruppe": now}},
		{"ready": false}
	);
=======*/
	console.log (Meteor.call('useridzuruck', getUser));
	Gruppen.insert({
		Gruppe:now,
		nutzer: getUser,
		ready: false,
		tager: false,
		auswahl: "",
	});
	return false;
   },
//>>>>>>> 41cedda96f4b5211a360a3c2a0a1d3756202076d

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
			console.log("test1");
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
					if (TempBilder.find({Bild7: {$exists: true}}).count() > 0) {
						if (Gruppen.findOne({"nutzer": Meteor.user().username}).tager) {
							FlowRouter.go('spielTager');
						} else {
							FlowRouter.go('spiel');
						}
					}
				},
				added: function(id, fields) {
					if (TempBilder.findOne().route1) {
						if (Gruppen.findOne({"nutzer": Meteor.user().username}).tager) {
							FlowRouter.go('spielTager');
						}
						FlowRouter.go('spiel');
					}	else if (TempBilder.findOne().route2) {
						console.log("zwischenstand");
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
	showPics: function() {
		zeiger = TempBilder.findOne();
		merke = new Mongo.Collection();
/*		for (i=0; i<8;i++) {zeiger = TempBilder.find().fetch();
			id = zeiger[0].[i].
			console.log(id);
			pic = Bilder.find(_id : id).fetch();
			console.log(pic);
			merke.insert({_id : zeiger[i]._id, "webResolutionUrlUrl" : pic[0].webResolutionUrlUrl});
		}*/

		pic = Bilder.findOne({_id : zeiger.Bild0});
		merke.insert({_id : zeiger.Bild0,"webResolutionUrlUrl" :pic.webResolutionUrlUrl, "Nummer" : "0" });

		pic = Bilder.findOne({_id : zeiger.Bild1});
		merke.insert({_id : zeiger.Bild1,"webResolutionUrlUrl" :pic.webResolutionUrlUrl, "Nummer" : "1" });

		pic = Bilder.findOne({_id : zeiger.Bild2});
		merke.insert({_id : zeiger.Bild2,"webResolutionUrlUrl" :pic.webResolutionUrlUrl, "Nummer" : "2" });

		pic = Bilder.findOne({_id : zeiger.Bild3});
		merke.insert({_id : zeiger.Bild3,"webResolutionUrlUrl" :pic.webResolutionUrlUrl, "Nummer" : "3" });

		pic = Bilder.findOne({_id : zeiger.Bild4});
		merke.insert({_id : zeiger.Bild4,"webResolutionUrlUrl" :pic.webResolutionUrlUrl, "Nummer" : "4" });

		pic = Bilder.findOne({_id : zeiger.Bild5});
		merke.insert({_id : zeiger.Bild5,"webResolutionUrlUrl" :pic.webResolutionUrlUrl, "Nummer" : "5" });

		pic = Bilder.findOne({_id : zeiger.Bild6});
		merke.insert({_id : zeiger.Bild6,"webResolutionUrlUrl" :pic.webResolutionUrlUrl, "Nummer" : "6" });

		pic = Bilder.findOne({_id : zeiger.Bild7});
		merke.insert({_id : zeiger.Bild7,"webResolutionUrlUrl" :pic.webResolutionUrlUrl, "Nummer" : "7" });

		return merke.find();
	}



})

Template.raten.events({
	'click .bild': function(){
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
			const result = Meteor.call('auswaehlen', this._id, f_meineGruppe());
			handler = Meteor.subscribe('spielStart',f_meineGruppe(), {
				onReady: function() {
				}
			});
		});
/**		const handle = query.observeChanges({
			changed: function(id, fields) {
				console.log("changed");
			},
			added: function(id, fields) {
				console.log("added");		
			}
		}); */
	}	 
})

Template.taggen.helpers({
	showPic: function() {
		zeiger = TempBilder.findOne();
		pic = Bilder.findOne({_id : zeiger.richtig});
		return {id : zeiger.richtig,"webResolutionUrlUrl" :pic.webResolutionUrlUrl };
	}
})