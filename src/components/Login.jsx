// LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css'; // Import custom CSS if needed
import { jwtDecode } from "jwt-decode";


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();



  const handleSubmit = (e) => {
    e.preventDefault();

    // Save user details to local storage
    let userDetails = { name, email };
    localStorage.setItem("user", JSON.stringify(userDetails));

    // Redirect to Home page
    navigate('/');
  };


  // const handleGoogle=(e)=>{
  //   e.preventDefault();

  //    // Save user details to local storage
  //    userGoogle = { name, email };
  //    localStorage.setItem("user", JSON.stringify(userGoogle));


  //    // Redirect to Home page
  //    navigate('/');
  // }



  // const [decoded, setDecoded] = useState(null);

  // useEffect(() => {
  //   const storedDecoded = localStorage.getItem("decoded");
  //   if (storedDecoded) {
  //     setDecoded(JSON.parse(storedDecoded));
  //   }
  // }, []);


  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">Login</h1>
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        {/* <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        /> */}
        <button type="submit" className="login-button login-button2">Login</button>
      </form>

      <h1>Or</h1>

      <div className="googleLogin">
        <button>
          <GoogleLogin
            onSuccess={(response) => {
              const decodedToken = jwtDecode(response.credential);
              
              setName(decodedToken.name);
              setEmail(decodedToken.email);

              // Store user details in local storage after state update
              const userGoogle = { name: decodedToken.name, email: decodedToken.email };
              localStorage.setItem("user", JSON.stringify(userGoogle));

              // Redirect to Home page
              navigate('/');
            }}
            onError={() => {
              console.log('Login Failed');
            }}
          />
        </button>
      </div>

    </div>
  );
};

export default LoginPage;
