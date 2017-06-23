import { Mongo } from 'meteor/mongo';
export const Messages = new Mongo.Collection('messages');
export const Gruppen = new Mongo.Collection('gruppen');
export const Bilder = new Mongo.Collection('bilder');
export const TempBilder = new Mongo.Collection('tempBilder');
export const Tags = new Mongo.Collection('tags');
export const BilderLokal = new Mongo.Collection('bilderLokal');