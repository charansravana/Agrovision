import { Link } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import "./HomePage.css";
import logo from '/agro logo black 2.png';
import leaf from '/pagelines-brands-solid.png';
import magic from '/magic-wand-black.png';
import support from '/headset-solid.png';

import axios from "axios";

const GOOGLEAPI = import.meta.env.VITE_GOOGLEAPI;

const App = () => {

  const [selectedImage, setSelectedImage] = useState(null);
  const [isModelRun, setIsModelRun] = useState(false); // Track if the model has been run
  const [isOpen, setIsOpen] = useState(false);



  // handeling login page 

  const [user, setUser] = useState(null); 

  useEffect(() => {
    // Retrieve user details from local storage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };



  // side bar handleing 

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };



  let resultText = "Phytophthora infestans";

  const [answer, setAnswer] = useState("");
  // const [question, setQuestion] = useState("");




  // Function to handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setIsModelRun(false); // Reset the model run state when a new image is selected
    }
  };


  


  // Function to handle running the AI model
  const handleRunModel = () => {
    if (!selectedImage) {
      alert("Please select an image first!");
      return;
    }

    if (isModelRun) {
      return; // Prevent the function from running again for the same image
    }

    console.log("AI Model running...");
      const result = document.getElementById("result");
      result.style.display = "flex";

      const aiButton = document.getElementById("aiButton");
      aiButton.style.display = "flex";

      location.href='./#result'

      // const resultText = "Phytophthora infestans";
      const typingSpeed = 80;
      let index = 0;

      function typeWriter() {
          if (index < resultText.length) {
              document.getElementById("typedText").innerHTML += resultText.charAt(index);
              index++;

              // Scroll the window smoothly as the text is being written
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });


              setTimeout(typeWriter, typingSpeed);
          } else {
              document.getElementById("typedText").style.animation = "none"; // Stop caret blinking after text is complete
          }
      }

      typeWriter();

      setIsModelRun(true); // Set the state to indicate the model has been run for the current image

      

  };



  // useEffect to add the enter keyup event listener only once when the enter key is pressed and image is selected
  
  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.key === 'Enter' && selectedImage && !isModelRun) {
        handleRunModel();
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedImage, isModelRun]); 



  // for ai chatbot 


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

  
  
  // setAnswer(response ["data"]["candidates"][0]["content"]["parts"][0]["text"]);


  return (
    <div className="min-h-screen flex flex-col items-center homepage">

      

      {/* Navbar */}
      
      <nav className="md:mb-12">
        <img src={logo} alt="logo"/>

        <ul className='flex flex-row gap-20'>
          <li className='text-gray-700 font-bold'><Link to="/kvk">Neraby KVK</Link></li>
          <li className='text-gray-700 font-bold'><Link to="/weather">Weather</Link></li>
          <li className='text-gray-700 font-bold '><Link to="/market">Market</Link></li>
          <li className='text-gray-700 font-bold '><Link to="/howToUse">How to use</Link></li>
        </ul>

        {user ? (
          <div>
            <button onClick={toggleSidebar} className="sidebar-icon">
              ☰
            </button>

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
              <div className="menu-bar">
                <button onClick={toggleSidebar} className="sidebar-icon-close">
                  ☰
                </button>
                <span className="user-details">Name: {user.name}</span>
                <span className="user-details">Email: {user.email}</span>
                <button onClick={handleLogout} className="logout-button">Logout</button>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/login" className="login-button">Login</Link>
        )}
       
      </nav>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 rounded-xl shadow-xl w-full md:w-3/4 container">
        
        {/* Left Column: Image Upload */}
        <div className="flex flex-col items-center">
          <div className="border-2 border-dashed border-gray-500 w-full h-64 flex items-center justify-center mb-4">
            {selectedImage ? (  
              <img src={selectedImage} alt="Selected" className="object-cover w-full h-full rounded-lg" />
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

        {/* Right Column: Heading and Button */}
        <div className="flex flex-col items-center justify-center text-center right-column">
          <h1 className="text-2xl md:text-4xl font-bold mb-5 text-white flex flex-row"><span><img src={leaf} alt="leaf" className="size-9"/></span>Upload image of crops on the left side</h1>
          <h2 className="text-sm md:text-lg font-bold mb-10 text-gray-400">Please upload high quality images of crops for better results in detection of the disease</h2>
          <button 
            onClick={handleRunModel}
            className="w-2/3 md:w-1/3 h-12 font-extrabold button">
            Find disease
          </button>
        </div>
      </div>

      <div className="talktoexpert">
        <button 
          className="font-extrabold">
            <img src={support} alt="" />
        </button>
      </div>

      <div className="hidden p-10 rounded-xl shadow-xl w-full md:w-3/4 mt-10 justify-center items-center flex-col " id="result">
        <h1 className="text-2xl md:text-4xl mb-5 text-white font-extrabold">Result</h1>
        <h2 className="text-sm md:text-xl font-bold text-white m-5 typing" id="typedText">The disease is : </h2>
      </div>

      {/* <textarea 
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        cols={30}
        rows={10}

      ></textarea> */}

      <button 
            onClick={runChatbot}
            className="hidden w-2/3 md:w-1/3 h-12 font-extrabold button flex-row justify-center items-center"
            id="aiButton" >
            Get solution <span><img src={magic} alt="" className="size-4" /></span>
      </button>

      <div className="hidden p-10 mb-20 rounded-xl shadow-xl w-full md:w-3/4 mt-10 justify-center items-center flex-col bg-gradient-to-r from-purple-900 to-indigo-900" id="chatbot">
        <h1 className="text-2xl md:text-4xl mb-5 text-black font-extrabold flex flex-row justify-center items-center gap-5">Agrovision <span><img src={magic} alt="magic" className="size-8" /></span></h1>

       

        <h2 className="text-sm md:text-xl font-bold text-white m-5 typing">{answer}</h2>
      </div>

    </div>
    
  );
};

export default App;
