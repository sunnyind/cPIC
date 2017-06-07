import '../ui/layouts/homeLayout.html'
import '../ui/layouts/mainLayout.html'
import '../ui/layouts/startMenu.html'
import '../ui/layouts/header.html'
import '../pages/getStarted.html'
import '../pages/miniGame.html'
import '../pages/infos.html'

import '../pages/userList.html'
import '../pages/message.html'
import '../pages/group.html'

FlowRouter.route('/', {
	name: 'home',
	action() {
		BlazeLayout.render('homeLayout');
		console.log("Looking at a list?");
	}
});


FlowRouter.route('/start', {
	name: 'start',
	action() {
		BlazeLayout.render('mainLayout', {main: 'getStarted'});
		console.log("Looking at a start?");
	}
});

FlowRouter.route('/infos', {
	name: 'infos',
	action() {
		BlazeLayout.render('mainLayout', {main: 'infos'});
		console.log("Looking at infos?");
	}
});