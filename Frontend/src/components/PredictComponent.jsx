import React, { useState } from "react";

const PredictComponent = () => {
    const [inputData, setInputData] = useState([1.2, 3.4, 5.6]); // Example input
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState(null);

    const handlePredict = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input: inputData }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setPrediction(data.prediction);
        } catch (err) {
            setError(err.message);
            console.error("Error:", err);
        }
    };

    return (
        <div>
            <h2>ML Model Prediction</h2>
            <button onClick={handlePredict}>Get Prediction</button>

            {prediction && <p>Prediction: {prediction}</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
        </div>
    );
};

export default PredictComponent;


// import React, { useState } from "react";

// const PredictComponent = () => {
//     const [inputData, setInputData] = useState([1.2, 3.4, 5.6]); // Example input
//     const [prediction, setPrediction] = useState(null);
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(false);

//     // Handle change for each input field
//     const handleChange = (index, value) => {
//         const newInputData = [...inputData];
//         newInputData[index] = parseFloat(value); // Ensure it's a number
//         setInputData(newInputData);
//     };

//     // Handle the prediction request
//     const handlePredict = async () => {
//         setLoading(true); // Start loading
//         setError(null); // Reset error state before making a new request

//         try {
//             const response = await fetch("http://127.0.0.1:5000/predict", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ input: inputData }),
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }

//             const data = await response.json();
//             setPrediction(data.prediction); // Set prediction result
//         } catch (err) {
//             setError(err.message); // Set error if request fails
//             console.error("Error:", err);
//         } finally {
//             setLoading(false); // Stop loading
//         }
//     };

//     return (
//         <div>
//             <h2>ML Model Prediction</h2>

//             {/* Dynamic input fields */}
//             <div>
//                 <input
//                     type="number"
//                     value={inputData[0]}
//                     onChange={(e) => handleChange(0, e.target.value)}
//                     placeholder="Feature 1"
//                 />
//                 <input
//                     type="number"
//                     value={inputData[1]}
//                     onChange={(e) => handleChange(1, e.target.value)}
//                     placeholder="Feature 2"
//                 />
//                 <input
//                     type="number"
//                     value={inputData[2]}
//                     onChange={(e) => handleChange(2, e.target.value)}
//                     placeholder="Feature 3"
//                 />
//             </div>

//             {/* Prediction button */}
//             <button onClick={handlePredict} disabled={loading}>
//                 {loading ? "Processing..." : "Get Prediction"}
//             </button>

//             {/* Display results or errors */}
//             {prediction && <p>Prediction: {prediction}</p>}
//             {error && <p style={{ color: "red" }}>Error: {error}</p>}
//         </div>
//     );
// };

// export default PredictComponent;
