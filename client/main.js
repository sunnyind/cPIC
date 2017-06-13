import { Random } from 'meteor/random';

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
 

Meteor.subscribe('userStatus')
Meteor.subscribe('userGruppen')
//ein paar allgemeine Funktionen

function f_meineGruppe (){
	return Gruppen.findOne({"nutzer": Meteor.user().username}).Gruppe;
}

function f_seineGruppe (x){
	return Gruppen.findOne({"nutzer": x}).Gruppe
}

function randNumber(min, max) {
		return Math.floor( Random.fraction() * (max-min+1))+min;
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
		{$set: {"Gruppe": now}}
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

		})

		target.text.value ='';

	}
})

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


	randBilder(){
		x = true; // random Zahl nicht im Zahlenarray
		zeiger = Bilder.find();
		max = zeiger.count(); // Anzahl Bilder in db
		randNums = [0,0,0,0,0,0,0,0]; // Array mit random Zahlen
		for (i = 0; i< randNums.length; i++) {
			rand = randNumber(0,max); // random Zahl zwischen 1 und Anzahl Bilder
			console.log(rand);
/*			for (j = 0; j < randNums.length; j++) {
				if (randNums[j] == rand) { //random Zahle bereits im Array
					i--; 
					x = false;
					break;
				}
			}*/
			if (x) {
				randNums[i] = rand;
			} else {
				x = true;
			}

		}
		zeiger = Bilder.find().fetch();
		//merke = zeiger.toArray(); //Array mit den Bildern
		randPics = new Mongo.Collection();
		for (i = 0; i<randNums.length; i++) {
			a = randNums[i];
			randPics.insert(zeiger[a]);
		}
		return randPics.find();
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