import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phoneNumber:{type:Number , unique:true,required: true},
    debt:{type:Number, default:0},
    orders: {
        type:[mongoose.Types.ObjectId],
        ref:"Order",
        default:[]
    },
  },
  { timestamps: true }
);

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;
