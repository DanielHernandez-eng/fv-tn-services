
import { mongoose } from "mongoose";

const merchantSchema = mongoose.Schema({
  shop_id: {
    type: String
  },
  id_token: {
    type: String
  },
  access_token: {
    type: String
  },
  scope: {
    type: String
  },
  user_id: {
    type: Number
  }
});

export default mongoose.model('Merchant',merchantSchema);

