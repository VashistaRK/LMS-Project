import mongoose from "mongoose";

const PurchaseRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // UUID / normal string course ids, NOT objectIds:
    courseIds: [{ type: String, required: true }],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("PurchaseRequest", PurchaseRequestSchema);
