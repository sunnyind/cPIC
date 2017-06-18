import { Meteor } from 'meteor/meteor';
import { Messages } from '../imports/api/messages.js';
import { Gruppen } from '../imports/api/messages.js';
import '../imports/api/messages.js';


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
})

Meteor.startup(() => {
  // code to run on server at startup
});


