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
import { TempBilder } from'../imports/api/messages.js';

Meteor.subscribe('userStatus')
Meteor.subscribe('userGruppen')
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

  'submit .user_online_einladen'(event){
	const nameeinladen = event.target.sub.value;
	const test = target.submit.value;
	var now = f_meineGruppe();
		//Gruppen.find({"nutzer": Meteor.user().username})
	Gruppen.update(
		{"nutzer": nameeinladen},
		{$set: {"Gruppe": now}},
		{"ready": false}
	);

   }
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
					FlowRouter.go('spiel');
				},
				added: function(id, fields) {
					FlowRouter.go('spiel');
				}
			});
		}
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
		return TempBilder.find({"Gruppe" : f_meineGruppe()},{_id:0, "Bilder": 1}).fetch();
	}



})

Template.raten.events({
	'click .bild': function(){
		x = document.getElementById(this._id);
		y = document.getElementsByClassName("bild");
		for (i=0; i< y.length; i++) {
			if (y[i].style.borderColor== "blue") {
				y[i].style.borderColor= "grey";
			}
		}
		x.style.borderColor = "blue";

	}	
})