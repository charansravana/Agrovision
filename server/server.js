const express = require("express");
const onnx = require("onnxruntime-node");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");

const app = express();
app.use(cors());

// Configure multer to store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    try {
        if (!req.file) {
            console.error("No file uploaded");
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("Received file:", req.file.originalname, "Size:", req.file.size);

        // Change target dimensions to match model expected size: 150x150
        const targetWidth = 150;
        const targetHeight = 150;

        // Preprocess the image using sharp:
        // - Resize to 150x150
        // - Convert to PNG and remove any alpha channel
        // - Extract raw pixel data in HWC order (Height, Width, Channels)
        const resizedImageBuffer = await sharp(req.file.buffer)
            .resize(targetWidth, targetHeight)
            .toFormat("png")
            .removeAlpha()
            .raw()  // Get raw pixel data in HWC order (R, G, B)
            .toBuffer();

        // Verify that the image buffer has the expected length: targetWidth * targetHeight * 3
        const numPixels = targetWidth * targetHeight * 3;
        if (resizedImageBuffer.length !== numPixels) {
            console.error("Unexpected image data length:", resizedImageBuffer.length, "expected:", numPixels);
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
        const tensorInput = new onnx.Tensor("float32", floatArray, [1, targetHeight, targetWidth, 3]);

        // Use the model's input name from session.inputNames
        const inputName = session.inputNames[0];
        console.log(`Using model input key: ${inputName}`);

        // Run the inference session
        const result = await session.run({ [inputName]: tensorInput });
        const outputName = session.outputNames[0];
        const prediction = result[outputName].data;

        console.log("📌 Prediction Output:", prediction);
        res.json({ prediction });
    } catch (error) {
        console.error("❌ Prediction Error:", error.message);
        console.error(error);
        res.status(500).json({ error: "Error processing prediction" });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
