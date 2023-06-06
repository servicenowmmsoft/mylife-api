import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const reReviewsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  parentId: mongoose.Schema.Types.ObjectId,
  rate: {
    type: Number
  },
  details: {
    type: String
  },
  category: {
    type: String
  },
  subCategory: {
    type: String
  },
  slug: {
    type: String,
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

export default mongoose.model('reReview', reReviewsSchema);