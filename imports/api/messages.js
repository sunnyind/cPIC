import { Mongo } from 'meteor/mongo';
export const Messages = new Mongo.Collection('messages');
export const Gruppen = new Mongo.Collection('gruppen');
Bilder = new Mongo.Collection('bilder');
export const TempBilder = new Mongo.Collection('tempBilder');

