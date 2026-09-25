import mongoose from 'mongoose';

const marketplaceListingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  price: { type: Number, required: true, min: 0, max: 10000000 },
  category: { type: String, required: true, trim: true, maxlength: 50 },
  condition: { type: String, trim: true, default: '', maxlength: 100 },
  description: { type: String, trim: true, default: '', maxlength: 1000 },
  sellerName: { type: String, trim: true, maxlength: 100 },
  contactEmail: { type: String, trim: true, lowercase: true, default: '', maxlength: 254 },
  contactPhone: { type: String, trim: true, default: '', maxlength: 30 },
  images: [{
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
  }],
}, { timestamps: true });

export default mongoose.models.MarketplaceListing || mongoose.model('MarketplaceListing', marketplaceListingSchema);
