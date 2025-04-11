import tensorflow as tf
import tf2onnx



tf.keras.backend.clear_session()  # Clear any existing Keras sessions

model = tf.keras.models.load_model("rice_leaf_model_v2.h5")

# Set output names based on the last layer name or create a dummy name.
if hasattr(model.layers[-1], 'name'):
    output_name = model.layers[-1].name
    model.output_names = [output_name]  # Assign the output names
else:
  model.output_names = ["output_1"] # Create a dummy name, not recommended!

# Convert to ONNX
onnx_model, _ = tf2onnx.convert.from_keras(
    model,
    input_signature=[tf.TensorSpec(shape=[None] + list(model.input_shape[1:]), dtype=tf.float32)],
    opset=13
)

# Save the ONNX model
with open("model_v2_charan.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

print("✅ Model converted successfully to ONNX!")