const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://rahulrajwwe2:12345678Rahul@cluster0.jcrzs.mongodb.net/?retryWrites=true&w=majority", {})

const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))
db.once("open", () => console.log("✅ Connected to MongoDB"))

const cardConfigSchema = new mongoose.Schema(
  {
    formId: {
      type: String,
      required: true,
      unique: true, // Ensure one config per form
    },
    formData: mongoose.Schema.Types.Mixed,
    layoutSelections: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    strict: false,
    minimize: false,
    versionKey: false,
  },
)

const CardConfig = mongoose.model("CardConfig", cardConfigSchema)

app.delete("/clear-all-data", async (req, res) => {
  try {
    await mongoose.connection.db.dropCollection("cardconfigs")

    res.status(200).json({
      message: "All card configurations cleared successfully",
      note: "Collection dropped and will be recreated on next save",
    })
  } catch (error) {
    if (error.message.includes("ns not found")) {
      res.status(200).json({
        message: "No existing data to clear",
        note: "Collection will be created on first save",
      })
    } else {
      console.error("Clear error:", error)
      res.status(500).json({
        error: "Failed to clear card configurations",
        details: error.message,
      })
    }
  }
})

app.post("/save-card", async (req, res) => {
  try {
    const { formId, formData, layoutSelections } = req.body

    console.log("Saving card for form:", formId)

    // Use findOneAndUpdate with upsert to create or update
    const cardConfig = await CardConfig.findOneAndUpdate(
      { formId },
      {
        formId,
        formData,
        layoutSelections,
        updatedAt: new Date(),
      },
      {
        upsert: true, // Create if doesn't exist
        new: true, // Return updated document
        setDefaultsOnInsert: true, // Set defaults if creating new
      }
    )

    console.log("✅ Saved card configuration for form:", formId)
    res.status(201).json({
      message: "Card configuration saved successfully",
      cardId: cardConfig._id,
      formId: cardConfig.formId,
    })
  } catch (error) {
    console.error("Save error:", error)

    res.status(500).json({
      error: "Failed to save card configuration",
      details: error.message,
      errorName: error.name,
      suggestion: "Try clearing all data first with DELETE /clear-all-data",
    })
  }
})

app.get("/get-card/:formId", async (req, res) => {
  try {
    const { formId } = req.params
    const cardConfig = await CardConfig.findOne({ formId })

    if (!cardConfig) {
      return res.status(404).json({ error: "Card configuration not found" })
    }

    console.log("✅ Retrieved card configuration for form:", formId)
    res.status(200).json(cardConfig)
  } catch (error) {
    console.error("Get error:", error)
    res.status(500).json({ error: "Failed to retrieve card configuration" })
  }
})

app.get("/get-all-cards", async (req, res) => {
  try {
    const cardConfigs = await CardConfig.find().sort({ updatedAt: -1 })
    console.log("✅ Retrieved all card configurations:", cardConfigs.length, "cards")
    res.status(200).json(cardConfigs)
  } catch (error) {
    console.error("Get all error:", error)
    res.status(500).json({ error: "Failed to retrieve card configurations" })
  }
})

app.delete("/delete-card/:formId", async (req, res) => {
  try {
    const { formId } = req.params
    const result = await CardConfig.findOneAndDelete({ formId })

    if (!result) {
      return res.status(404).json({ error: "Card configuration not found" })
    }

    console.log("✅ Deleted card configuration for form:", formId)
    res.status(200).json({ message: "Card configuration deleted successfully" })
  } catch (error) {
    console.error("Delete error:", error)
    res.status(500).json({ error: "Failed to delete card configuration" })
  }
})

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))