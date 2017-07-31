import { Template } from 'meteor/templating';
import './getStarted.html';
import './message.js';




 import { Messages } from '../api/messages.js';
 import { Gruppen } from '../api/messages.js';
 handler = Meteor.subscribe('userMessages')
 handler_gruppe = Meteor.subscribe('userGruppen')


  Template.chat.onRendered(function () {
      console.log("es sollte gescrollt werden")
      $('.panel-body').scrollTop($('.media-list').height())
    
  });

 Template.chat.helpers({
   messages() {
     console.log('Nachricht');
     const query = Messages.find();
     handle = query.observeChanges({
      added: function(id, fields) {
         console.log("added");
         $('.panel-body').scrollTop($('.media-list').height());
       }
     });
     return Messages.find(); 
   },
 });

 Template.chat2.helpers({
   messages() {
     console.log('Nachricht');
     const query = Messages.find();
     handle = query.observeChanges({
      added: function(id, fields) {
         console.log("added");
         $('.panel-body').scrollTop($('.media-list').height());
      }
     });
     return Messages.find();
   },
 });

 Template.chat.events({
   'submit .new-message'(event) {
    console.log('eingabe');
     // Prevent default browser form submit
     event.preventDefault();
     // Get value from form element
     const target = event.target;
     const text = target.text.value;
     console.log(text);
     grp = Gruppen.findOne({"nutzer": Meteor.user().username}).Gruppe;
     // Insert a message into the collection
     Messages.insert({
      text,
      createdAt: new Date(), // current time
 	    owner: Meteor.userId(), username:Meteor.user().username,
      Gruppe: grp,
     });
     // Clear form
     target.text.value = '';
     // scroll to last message
     $('.panel-body').scrollTop($('.media-list').height())
	},
 });
