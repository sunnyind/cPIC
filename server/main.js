import { Meteor } from 'meteor/meteor';
import { Messages } from '../imports/api/messages.js';
import { Gruppen } from '../imports/api/messages.js';
import '../imports/api/messages.js';

Meteor.publish("userStatus", function() {
  return Meteor.users.find({ "status.online": true });
});

Meteor.publish("userGruppen", function() {
	return Gruppen.find();
});

Meteor.publish("userMessages", function(){
	 return Messages.find();
})

Meteor.startup(() => {
  // code to run on server at startup
});
