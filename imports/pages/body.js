import { Template } from 'meteor/templating';
import './getStarted.html';
import './message.js';




 import { Messages } from '../api/messages.js';
 Meteor.subscribe('userMessages')
 
 Template.chat.helpers({
   messages() {
     console.log('Nachricht');
     return Messages.find();
   },
 });

 Template.chat2.helpers({
   messages() {
     console.log('Nachricht');
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
     // Insert a message into the collection
     Messages.insert({
       text,
       createdAt: new Date(), // current time
 	  owner: Meteor.userId(), username:Meteor.user().username,
     });
     // Clear form
     target.text.value = '';
     // scroll to last message
     $('.panel-body').scrollTop($('.media-list').height())
	},
 });
