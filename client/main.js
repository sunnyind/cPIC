import '../imports/startup/routes.js';
import 'font-awesome/css/font-awesome.css';

import '../imports/pages/body.js';
import '../imports/startup/accounts-config.js';

import '../imports/pages/message';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';


 import { Gruppen } from '../imports/api/messages.js';
 

Meteor.subscribe('userStatus')

Template.body.helpers({
	actual_user(){
		return Meteor.user().username;
	}
})

Template.userList.({
  usersOnline:function(){
    return Meteor.users.find({ "status.online": true , "username":{$ne: Meteor.user().username}})
  },
 
})

Template.group.helpers({
	
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
