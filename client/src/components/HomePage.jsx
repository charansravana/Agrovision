import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./HomePage.css";
import logo from "/agro logo black 2.png";
import leaf from "/pagelines-brands-solid.png";
import magic from "/magic-wand-black.png";
import support from "/headset-solid.png";
import axios from "axios";

import {motion} from "framer-motion";


const GOOGLEAPI = import.meta.env.VITE_GOOGLEAPI;


const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModelRun, setIsModelRun] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [answer, setAnswer] = useState("");

  const [resultText, setResultText] = useState("Loading...");



  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setIsModelRun(false);
    }
  };




  function classPrediction(prediction) {
    if (prediction[0].length > 1) {
         prediction = prediction[0].indexOf(Math.max(...prediction[0]));
    } else {
        prediction =  prediction[0] > 0.5 ? 1 : 0;
    }

    return getPredictedClass(prediction)
}


// Fixed uploadImage function
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
      console.log("Uploading file:", file.name, "Size:", file.size);
      
      const response = await axios.post("http://localhost:5000/predict", formData, {
          headers: {
              "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
          onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload Progress: ${percentCompleted}%`);
          },
      });

      console.log("Server response:", response.data);

      if (response.data.prediction) {
          console.log("Prediction received:", response.data.prediction);
          // Return the prediction object directly
          return response.data.prediction;
      } else {
          throw new Error(response.data.error || "Upload failed");
      }
    
  } catch (error) {
      console.error("Error uploading image:", error);
      if (error.response) {
          console.error("Server response status:", error.response.status);
          console.error("Server response data:", error.response.data);
      } else if (error.request) {
          console.error("No response received:", error.request);
      } else {
          console.error("Error setting up request:", error.message);
      }
      
      const errorMessage = error.response?.data?.error || error.message || "Failed to process image";
      console.error("Final error message:", errorMessage);
      alert(`Error in uploadimage: ${errorMessage}`);
      return null;
  }
};

// Fixed getPredictedClass function
const getPredictedClass = (prediction) => {
  // Add debugging to see exactly what's being passed
  console.log("Prediction object received:", prediction);
  
  // Check if prediction is valid
  if (!prediction || typeof prediction !== "object") {
      console.error("Invalid prediction format:", prediction);
      return null; // Return null instead of a string to check in handleRunModel
  }
  
  // Convert to array of values
  const predictionArray = Object.values(prediction);
  
  if (predictionArray.length === 0) {
      console.error("Empty prediction array");
      return null;
  }
  
  // Find the maximum value
  const maxValue = Math.max(...predictionArray);
  console.log("Max probability:", maxValue);
  
  // Find the key (index) with this maximum value
  let predictedIndex = null;
  for (const [key, value] of Object.entries(prediction)) {
      if (value === maxValue) {
          predictedIndex = parseInt(key);
          break;
      }
  }
  
  console.log("Predicted index:", predictedIndex);
  
  // Disease labels corresponding to model output classes
  const diseaseLabels = [
      "Bacterial leaf blight",
      "Brown spot",
      "Leaf smut",
      "Healthy",
      "Powdery Mildew",
      "Bacterial Spot",
      "Late Blight",
      "Leaf Mold",
      "Yellow Leaf Curl Virus"
  ];
  
  // Check if the index is valid
  if (predictedIndex !== null && !isNaN(predictedIndex) && 
      predictedIndex >= 0 && predictedIndex < diseaseLabels.length) {
      return diseaseLabels[predictedIndex];
  } else {
      console.error("Invalid index:", predictedIndex);
      return null;
  }
};

// Fixed handleRunModel function
const handleRunModel = async () => {
  if (!selectedImage) {
      alert("Please select an image first!");
      return;
  }

  if (isModelRun) return;

  document.getElementById("result").style.display = "flex";
  document.getElementById("aiButton").style.display = "flex";

  try {
      const predictionData = await uploadImage(selectedImage);
      console.log("Prediction data returned from uploadImage:", predictionData);
      
      if (!predictionData) {
          throw new Error("No prediction data received.");
      }
      
      const result = getPredictedClass(predictionData);
      console.log("Disease prediction result:", result);
      
      if (!result) {
          throw new Error("Could not determine disease from prediction.");
      }
      
      setResultText(result);
      setIsModelRun(true);
      location.href = "./#result";

  } catch (error) {
      console.error("Error in handleRunModel:", error);
      setResultText("Error processing image. Please try again.");
  }
};



  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.key === "Enter" && selectedImage && !isModelRun) {
        handleRunModel();
      }
    };

    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedImage, isModelRun]);




async function runChatbot() {
  
  let question="suggest how to cure the following disease of crops : "+resultText+" give accurate answers and don't say tha ti can't give answer , try atleast . Don't give lengthy answer , just give a brief summary . don't use * symbol instead use 1,2,3... for points and try to answer in a multiple short paragraphs way but not points, use plain english";
  
  // Use a timeout to ensure the state is updated before the API call
  setTimeout(async () => {
    const chatbot = document.getElementById("chatbot");
    chatbot.style.display = "flex";
    setAnswer("Loading...");
    location.href='./#chatbot'
    
    try {
      const response = await axios({
        url:GOOGLEAPI,
        method: "POST",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });


      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

      setAnswer(response ["data"]["candidates"][0]["content"]["parts"][0]["text"]);
      
    } catch (error) {
      setAnswer("Error fetching response");
    }
  }, 100); // Wait 100ms for state to update

}



  return (
    <div className="min-h-screen flex flex-col items-center homepage">
      <nav className="md:mb-12">
        <img src={logo} alt="logo" />
        <ul className="flex flex-row gap-20">
          <li className="text-gray-700 font-bold">
            <Link to="/kvk">Nearby KVK</Link>
          </li>
          <li className="text-gray-700 font-bold">
            <Link to="/weather">Weather</Link>
          </li>
          <li className="text-gray-700 font-bold">
            <Link to="/market">Market</Link>
          </li>
          <li className="text-gray-700 font-bold">
            <Link to="/howToUse">How to use</Link>
          </li>
        </ul>
        {user ? (
          <div>
            <button onClick={toggleSidebar} className="sidebar-icon">
              ☰
            </button>
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
              <div className="menu-bar">
                <button onClick={toggleSidebar} className="sidebar-icon-close">
                  ☰
                </button>
                <span className="user-details">Name: {user.name}</span>
                <span className="user-details">Email: {user.email}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/login" className="login-button">
            Login
          </Link>
        )}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 rounded-xl shadow-xl w-full md:w-3/4 container">
        <div className="flex flex-col items-center">
          <div className="border-2 border-dashed border-gray-500 w-full h-64 flex items-center justify-center mb-4">
            {selectedImage ? (
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                className="object-cover w-full h-full rounded-lg"
              />
            ) : (
              <label className="bg-white text-black py-2 px-4 rounded-lg cursor-pointer hover:bg-gray-200 inputfile">
                Choose file
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-5 text-white flex flex-row">
            <span>
              <img src={leaf} alt="leaf" className="size-9" />
            </span>
            Upload image of crops on the left side
          </h1>
          <h2 className="text-sm md:text-lg font-bold mb-10 text-gray-400">
            Please upload high-quality images of crops for better results in
            detection of the disease
          </h2>
          <button
            onClick={handleRunModel}
            className="w-2/3 md:w-1/3 h-12 font-extrabold button"
          >
            Find disease
          </button>
        </div>
      </div>

      <div className="talktoexpert">
        <button className="font-extrabold">
          <img src={support} alt="Support" />
        </button>
      </div>

      <motion.div

        initial={{ opacity: 0 , y: -40 }}
        animate={{ opacity: 1 , y: 0 }}
        transition={{ duration: 1 , delay: 0.9 }}

        className="hidden p-10 rounded-xl shadow-xl w-full md:w-3/4 mt-10 justify-center  items-center flex-col"
        id="result"
      >
        <h1 className="text-2xl md:text-4xl mb-5 text-white font-extrabold">
          Result
        </h1>
        <motion.h2

          initial={{ opacity: 0 , y: -20 }}
          animate={{ opacity: 1 , y: 0 }}
          transition={{ duration: 1 , delay: 0.5 }}

          className="text-sm md:text-xl text-center font-bold text-white m-5 typing"
          id="resultId"
        >
          The disease is: {resultText}
        </motion.h2>
      </motion.div>


      <button 
            onClick={runChatbot}
            className="hidden w-2/3 md:w-1/3 h-12 font-extrabold button flex-row justify-center items-center"
            id="aiButton" >
            Ask AI for solution <span><img src={magic} alt="" className="size-4" /></span>
      </button>

      <div className="hidden p-10 mb-20 rounded-xl shadow-xl w-full md:w-3/4 mt-10 justify-center items-center flex-col bg-gradient-to-r from-purple-900 to-indigo-900" id="chatbot">
        <h1 className="text-2xl md:text-4xl mb-5 text-black font-extrabold flex flex-row justify-center items-center gap-5">Agrovision AI <span><img src={magic} alt="magic" className="size-8" /></span></h1>

       

        <h2 className="text-sm md:text-xl font-bold text-white m-5 typing">{answer}</h2>
      </div>


    </div>
  );
};

export default App;
