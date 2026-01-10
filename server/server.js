const express = require("express");
const onnx = require("onnxruntime-node");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");

require("dotenv").config();

const app = express();
app.use(cors());

// Increase body parser limits for large images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configure multer to store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Load the ONNX model
let session;
async function loadModel() {
  try {
    session = await onnx.InferenceSession.create("model.onnx");
    console.log("✅ ONNX Model Loaded!");
    console.log(`🟢 Model Input Name(s): ${session.inputNames}`);
    console.log(`🟢 Model Output Name(s): ${session.outputNames}`);
  } catch (error) {
    console.error("❌ Error loading ONNX model:", error);
    process.exit(1);
  }
}
loadModel();

// API endpoint for predictions that accepts an image file
app.post("/predict", upload.single("file"), async (req, res) => {
  // Set a longer timeout for this endpoint (2 minutes)
  req.setTimeout(120000);

  const startTime = Date.now();
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(
      "Received file:",
      req.file.originalname,
      "Size:",
      req.file.size
    );

    // Correcting the target dimensions to match the model's expected input (224x224)
    const targetWidth = 224;
    const targetHeight = 224;

    // Preprocess the image using sharp:
    // - Resize to 224x224
    // - Convert to PNG and remove any alpha channel
    // - Extract raw pixel data in HWC order (Height, Width, Channels)
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(targetWidth, targetHeight)
      .toFormat("png")
      .removeAlpha()
      .raw() // Get raw pixel data in HWC order (R, G, B)
      .toBuffer();

    // Verify that the image buffer has the expected length: targetWidth * targetHeight * 3
    const numPixels = targetWidth * targetHeight * 3;
    if (resizedImageBuffer.length !== numPixels) {
      console.error(
        "Unexpected image data length:",
        resizedImageBuffer.length,
        "expected:",
        numPixels
      );
      return res.status(400).json({ error: "Unexpected image data length" });
    }

    // Normalize pixel values (0-255 to 0-1) and store in a Float32Array.
    // The raw pixel data is in HWC order, which is what the model expects.
    const floatArray = new Float32Array(numPixels);
    for (let i = 0; i < numPixels; i++) {
      floatArray[i] = resizedImageBuffer[i] / 255.0;
    }

    // Create an ONNX tensor with the expected shape [1, targetHeight, targetWidth, 3]
    // Note: The tensor constructor signature is: new onnx.Tensor(type, data, dims)
    const tensorInput = new onnx.Tensor("float32", floatArray, [
      1,
      targetHeight,
      targetWidth,
      3,
    ]);

    // Use the model's input name from session.inputNames
    const inputName = session.inputNames[0];
    console.log(`Using model input key: ${inputName}`);

    // Run the inference session
    console.log("Starting model inference...");
    const inferenceStartTime = Date.now();
    const result = await session.run({ [inputName]: tensorInput });
    const inferenceTime = Date.now() - inferenceStartTime;
    console.log(`Model inference completed in ${inferenceTime}ms`);

    const outputName = session.outputNames[0];
    const prediction = result[outputName].data;

    const totalTime = Date.now() - startTime;
    console.log(`📌 Prediction Output:`, prediction);
    console.log(`Total processing time: ${totalTime}ms`);
    res.json({ prediction });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error("❌ Prediction Error:", error.message);
    console.error(`Error occurred after ${totalTime}ms`);
    console.error(error);

    // Check if it's a timeout error
    if (error.message && error.message.includes("timeout")) {
      res.status(504).json({
        error:
          "Request timeout. Image processing took too long. Please try with a smaller image.",
      });
    } else {
      res
        .status(500)
        .json({ error: error.message || "Error processing prediction" });
    }
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the ONNX Model Prediction API!",
    availableEndpoints: ["/predict"],
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
