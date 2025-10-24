const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["bin", "dump"], required: true },
    description: { type: String, required: true },
    photo: { type: String }, 
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Collected"], default: "Pending" }
  },
  { timestamps: true, collection: "reports" }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
