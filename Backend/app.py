# from flask import Flask, request, jsonify
# import numpy as np
# import tensorflow as tf
# from tensorflow.keras.models import load_model
# from flask_cors import CORS
# # set TF_ENABLE_ONEDNN_OPTS=0 

# # Initialize Flask app
# app = Flask(__name__)
# CORS(app)  # Enable Cross-Origin Resource Sharing

# # Load your trained model
# model = load_model(r"C:/SIH/agrovision/Backend/plant_disease_model.h5")
# @app.route('/')
# def home():
#     return "Hello, Flask is running successfully!"

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         # Get input data from frontend
#         data = request.json
#         input_data = np.array(data['input']).reshape(1, -1)  # Adjust based on your model

#         # Make prediction
#         prediction = model.predict(input_data).tolist()

#         return jsonify({"prediction": prediction})

#     except Exception as e:
#         return jsonify({"error": str(e)})



# if __name__ == '__main__':
#     app.run(debug=True)


# from flask import Flask, request, jsonify
# import numpy as np
# import tensorflow as tf
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing import image
# import cv2
# import os
# import io
# from PIL import Image
# from flask_cors import CORS

# # Initialize Flask app
# app = Flask(__name__)
# CORS(app)  # Enable Cross-Origin Resource Sharing

# # Load your trained model
# model = load_model(r"C:/SIH/agrovision/Backend/plant_disease_model.h5")

# # Define image preprocessing function
# def preprocess_image(img, target_size=(224, 224)):  # Change size based on model input
#     img = img.resize(target_size)  # Resize image
#     img = np.array(img) / 255.0  # Normalize pixel values
#     img = np.expand_dims(img, axis=0)  # Add batch dimension
#     return img

# @app.route('/')
# def home():
#     return "Hello, Flask is running successfully!"

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         if 'file' not in request.files:
#             return jsonify({"error": "No file uploaded"}), 400

#         file = request.files['file']
        
#         if file.filename == '':
#             return jsonify({"error": "No selected file"}), 400

#         # Read image file and process
#         img = Image.open(io.BytesIO(file.read()))
#         processed_img = preprocess_image(img)

#         # Make prediction
#         prediction = model.predict(processed_img)

#         # Convert prediction to readable format (Modify this based on your model output)
#         predicted_class = np.argmax(prediction, axis=1)[0]

#         return jsonify({"prediction": int(predicted_class)})

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True)


from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from flask_cors import CORS
from PIL import Image
import io

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Load the trained model
model = load_model(r"C:/SIH/agrovision/Backend/plant_disease_model.h5")

@app.route('/')
def home():
    return "Hello, Flask is running successfully!"

@app.route('/predict', methods=['GET','POST'])
def predict():
    try:
        # Check if an image file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        
        # Open the image file
        img = Image.open(io.BytesIO(file.read()))
        
        # Preprocess the image (resize & normalize)
        img = img.resize((224, 224))  # Adjust based on your model's input size
        img = np.array(img) / 255.0   # Normalize pixel values
        img = np.expand_dims(img, axis=0)  # Add batch dimension

        # Make prediction
        prediction = model.predict(img).tolist()

        return jsonify({"prediction": prediction})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
