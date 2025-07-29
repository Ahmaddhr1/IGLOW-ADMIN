import mongoose, { Mongoose } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number },
    price: { type: Number },
    initialPrice: { type: Number },
    profit: { type: Number },
    gender: {
      type: String,
      enum: ["male", "female","unisex"],
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    nbOfOrders: { type: Number, default: 0 },
    img: { type: [String] },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
