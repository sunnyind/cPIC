import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform']);

Beschriftung = new Mongo.Collection('beschriftung');
Beschriftung.attachSchema(new SimpleSchema({
    comment: {
        type: String,
        label: "Was lesen Sie?"
    },
    author: {
    	type: String,
        label: "Autor",
    	autoValue: function(){
    		return this.userId
    	},
    	autoform: {
    		type: "hidden"
    	}
    }
}, { tracker: Tracker}));

Beschriftung.allow({
    insert: function(userId, doc) {
        return !!userId;
    }
})