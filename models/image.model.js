import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const imageSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String
  },
  ApiKey: {
    type: String
  },
  tags: {
    type: String
  },
  keywords: {
    type: String
  },
  FacebookURL: {
    type: String
  },
  TwitterURL: {
    type: String
  },
  LinkedinURL: {
    type: String
  },
  InstagramURL: {
    type: String
  },
  mapLongitude: {
    type: String
  },
  mapLatitude: {
    type: String
  },
  city: {
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
  website: {
    type: String
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  rate: {
    type: Number
  },
  reviewCount: {
    type: Number
  },
  price: {
    type: Number
  },
  quantity: {
    type: Number
  },
  description: {
    type: String,
    default: "More Information"
  },
  details: {
    type: String
  },
  images: {
    type: Array
  },
  thumbImage: {
    type: Array
  },
  backgroundImages: {
    type: Array
  },
  carouselImages: {
    type: Array
  },
  videoYoutube: {
    type: String
  },
  videoVimeo: {
    type: String
  },
  galleryThumbnails: {
    type: Array
  },
  sliderImages: {
    type: Array
  },
  promoVideoYoutube: {
    type: String
  },
  promoVideoVimeo: {
    type: String
  },
  element: {
    type: String
  },
  species: {
    type: String
  },
  type: {
    type: String
  },
  grade: {
    type: String
  },
  leaderSkill: {
    type: String
  },
  skill1: {
    type: String
  },
  skill2: {
    type: String
  },
  skill3: {
    type: String
  },
  skill4: {
    type: String
  },
  image1: {
      data: Buffer,
      contentType: String
  },
  image2: {
    data: Buffer,
    contentType: String
  },
  image3: {
      data: Buffer,
      contentType: String
  },
  image4: {
      data: Buffer,
      contentType: String
  },
  thumbImage1: {
      data: Buffer,
      contentType: String
  },
  thumbImage2: {
      data: Buffer,
      contentType: String
  },
  userId: mongoose.Schema.Types.ObjectId,
  user: {
    type: Object,
    default: {
      "name": "admin"
    }
  },
  customerName: {
    type: String
  },
  paymentState: {
    type: String
  },
  bookingDate: {
    type: Date
  },
  persons: {
    type: Number
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
  },
  FreeWiFi: {
    type: Boolean
  },
  Parking: {
    type: Boolean
  },
  FitnessCenter: {
    type: Boolean
  },
  NonSmokingRooms: {
    type: Boolean
  },
  AirportShuttle: {
    type: Boolean
  },
  AirConditioning: {
    type: Boolean
  },
  Events: {
    type: Boolean
  },
  FriendlyWorkspace: {
    type: Boolean
  },
  SidebarWidgetsBookingForm: {
    type: Boolean
  },
  SidebarWidgetsPriceRange: {
    type: Boolean
  },
  SidebarWidgetsInstagram: {
    type: Boolean
  },
});

export default mongoose.model('Image', imageSchema);