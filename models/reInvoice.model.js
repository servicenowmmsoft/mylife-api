import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const reInvoiceSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  category: {
    type: String
  },
  subCategory: {
    type: String
  },
  title: {
    type: String,
  },
  other: {
    type: String,
  },
  price: {
    type: String,
  },
  code: {
    type: String,
  },
  specification: {
    type: String,
  },
  slug: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
  },
  customerName: {
    type: String,
  },
  amount: {
    type: Number
  },
  purchaseOn: {
    type: Date
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
    type: String //Received | Pending | Declined
  },
  active: {
    type: Boolean
  }
});

export default mongoose.model('reInvoice', reInvoiceSchema);