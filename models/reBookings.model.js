import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const reBookingsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  subCategory: {
    type: String
  },
  address: {
    type: String
  },
  persons: {
    type: Number
  },
  email: {
    type: String
  },
  paymentState: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  slug: {
    type: String,
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  userId: mongoose.Schema.Types.ObjectId,
  user: {
    type: Object
  },
  created: {
    type: Date
  },
  createdBy: {
    type: String
  },
  modified: {
    type: Date
  },
  modifiedBy: {
    type: String
  },
  status: {
    type: String
  },
  active: {
    type: Boolean
  }
});

export default mongoose.model('reBooking', reBookingsSchema);