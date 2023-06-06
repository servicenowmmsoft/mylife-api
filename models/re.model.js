import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const realestateSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  keywords: {
    type: String
  },
  category: {
    type: String
  },
  subCategory: {
    type: String
  },
  code: {
    type: String
  },
  specification: {
    type: String
  },
  latitude: {
    type: String
  },
  longitude: {
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
  sidebarWidgetsInstagram: {
    type: Boolean
  },
  sidebarWidgetsPriceRange: {
    type: Boolean
  },
  sidebarWidgetsBookingForm: {
    type: Boolean
  },
  headerMedia: {
    type: String,
    default: "background-image"
  },
  headerMediaBGImage: {
    type: String,
    default: "/assets/img/listing/img1.jpg"
  },
  headerMediaCIImage: {
    type: String,
    default: "/assets/img/listing/img1.jpg"
  },
  slug: {
    type: String,
    required: true,
  },
  headerMediaVideoYoutube: {
    type: String
  },
  headerMediaVideoVimeo: {
    type: String
  },
  detail: {
    type: String
  },
  price: {
    type: String
  },
  priceMarket: {
    type: String
  },
  priceRange: {
    type: String
  },
  facilitiesFreeWiFi: {
    type: Boolean
  },
  facilitiesParking: {
    type: Boolean
  },
  facilitiesAirConditioning: {
    type: Boolean
  },
  facilitiesAirportShuttle: {
    type: Boolean
  },
  facilitiesEvents: {
    type: Boolean
  },
  facilitiesFriendlyWorkspace: {
    type: Boolean
  },
  facilitiesNonSmokingRooms: {
    type: Boolean
  },
  facilitiesFitnessCenter: {
    type: Boolean
  },
  contentWidgetsPromovideo: {
    type: Boolean
  },
  contentWidgetsPromovideoYoutube: {
    type: String
  },
  contentWidgetsPromovideoVimeo: {
    type: String
  },
  contentWidgetsGalleryThumbnails: {
    type: Boolean
  },
  contentWidgetsGalleryThumbnailsImage: {
    type: String,
    default: "/assets/img/listing/img1.jpg"
  },
  contentWidgetsSlider: {
    type: Boolean
  },
  contentWidgetsSliderImage: {
    type: String,
    default: "/assets/img/listing/img1.jpg"
  },
  yourSocialsFacebook: {
    type: String
  },
  yourSocialsTwitter: {
    type: String
  },
  yourSocialsLinkedin: {
    type: String
  },
  yourSocialsInstagram: {
    type: String
  },
  apiKey: {
    type: String
  },
  maps: {
    type: String
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

export default mongoose.model('Realestate', realestateSchema);