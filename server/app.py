# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import tensorflow as tf
# import numpy as np
# from PIL import Image
# import io
# import os
# import traceback
# import sys

# app = Flask(__name__)
# CORS(app, resources={
#     r"/*": {
#         "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
#         "methods": ["POST", "OPTIONS", "GET"],
#         "allow_headers": ["Content-Type"]
#     }
# })

# print("Loading model...")
# model = tf.keras.models.load_model("plant_disease_model.h5")
# print("Model loaded successfully!")

# @app.route("/upload", methods=["POST", "OPTIONS"])
# def upload_image():
#     if request.method == "OPTIONS":
#         return jsonify({"status": "ok"}), 200
        
#     try:
#         print("Received upload request")
        
#         # Check if file exists in request
#         if "file" not in request.files:
#             print("No file in request")
#             return jsonify({
#                 "error": "No file part",
#                 "success": False
#             }), 400

#         file = request.files["file"]
#         if file.filename == "":
#             print("No selected file")
#             return jsonify({
#                 "error": "No selected file",
#                 "success": False
#             }), 400

#         print(f"Processing file: {file.filename}")
        
#         # Read image data
#         try:
#             image_data = file.read()
#             print(f"Image size: {len(image_data)} bytes")
#             image = Image.open(io.BytesIO(image_data)).convert("RGB")
#             print(f"Image opened successfully: {image.size}")
#         except Exception as e:
#             print(f"Error reading image: {str(e)}")
#             return jsonify({
#                 "error": f"Error reading image: {str(e)}",
#                 "success": False
#             }), 400

#         # Preprocess image
#         try:
#             image = image.resize((224, 224))
#             img_array = np.array(image)
#             img_array = img_array.astype('float32') / 255.0
#             img_array = np.expand_dims(img_array, axis=0)
#             print(f"Image preprocessed successfully. Shape: {img_array.shape}")
#         except Exception as e:
#             print(f"Error preprocessing image: {str(e)}")
#             return jsonify({
#                 "error": f"Error preprocessing image: {str(e)}",
#                 "success": False
#             }), 400

#         # Make prediction
#         try:
#             predictions = model.predict(img_array)
#             predicted_class_index = np.argmax(predictions[0])
#             confidence = float(predictions[0][predicted_class_index])
#             print(f"Prediction made successfully. Index: {predicted_class_index}, Confidence: {confidence}")
            
#             class_labels = [
#                 "Healthy",
#                 "Early Blight",
#                 "Late Blight",
#                 "Bacterial Spot",
#                 "Leaf Mold"
#             ]  # Update these with your actual classes
            
#             predicted_class = class_labels[predicted_class_index]
#             print(f"Predicted class: {predicted_class}")
#         except Exception as e:
#             print(f"Error making prediction: {str(e)}")
#             print("Full error:", traceback.format_exc())
#             return jsonify({
#                 "error": f"Error making prediction: {str(e)}",
#                 "success": False
#             }), 500

#         return jsonify({
#             "prediction": predicted_class,
#             "confidence": confidence,
#             "success": True
#         })

#     except Exception as e:
#         print("Unexpected error:", traceback.format_exc())
#         return jsonify({
#             "error": str(e),
#             "details": traceback.format_exc(),
#             "success": False
#         }), 500

# if __name__ == "__main__":
#     app.run(debug=True, port=5000)