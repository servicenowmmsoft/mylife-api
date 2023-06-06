import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  fullname: {
    type: String,
  },
  status: {
    type: String,
  },
  active: {
    type: Boolean,
  },
  website: {
    type: String,
  },
  bio: {
    type: String,
  },
  facebookURL: {
    type: String,
  },
  twitterURL: {
    type: String,
  },
  linkedinURL: {
    type: String,
  },
  instagramURL: {
    type: String,
  },
  username: {
    type: String
  },
  password: {
    type: String
  },
  address: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  avatar:{
    type: String
  },
  images: {
    type: Array
  },
  token: {
    type: String
  },
  created: {
    type: Date
  },
  createdBy: {
    type: String,
    default: "Hung Nguyen"
  },
  lastLogin: {
    type: Date
  },
  modified: {
    type: Date
  },
  modifiedBy: {
    type: String,
    default: "Hung Nguyen"
  }
});

export default mongoose.model('User', userSchema);