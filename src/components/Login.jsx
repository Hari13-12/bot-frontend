import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [signInData, setSignInData] = useState({
    name: '',
    password: ''
  });
  const [message, setMessage] = useState(''); 
  const [mess, setMess] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: signUpData.name,
          email: signUpData.email,
          password: signUpData.password
        })
      });
      if (response.ok) {
        setMessage('Registration successful!');
        setSignUpData({ name: '', email: '', password: '' });
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Registration failed.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
      console.error('Error:', error);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: signInData.name,
          password: signInData.password
        })
      });
      if (response.ok) {
        const data = await response.json();
        Cookies.set("auth_token", data.access_token);
        Cookies.set("refresh_token", data.refresh_token);
        setSignInData({ name: '', password: '' });
        setMess('Login Successful');
        navigate("/dbconnector");
      } else {
        setMess('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setMess('An error occurred. Please try again later.');
      console.error('Error:', error);
    }
  };

  return (
    <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
      <div className="form-container sign-up-container">
        <form onSubmit={handleSignUp}>
          <h2>Create Account</h2>
          <input 
            type="text" 
            placeholder="Name" 
            required
            value={signUpData.name}
            onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
          />
          <input 
            type="email" 
            placeholder="Email" 
            required
            value={signUpData.email}
            onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
          />
          <input 
            type="password" 
            placeholder="Password" 
            required
            value={signUpData.password}
            onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
          />
          <button>Sign Up</button>
          {message && <div className="message-box">{message}</div>}
        </form>
      </div>

      <div className="form-container sign-in-container">
        <form onSubmit={handleSignIn}>
          <h1>Sign in</h1>
          <br />
          <input 
            type="text" 
            placeholder="Name" 
            value={signInData.name}
            required
            onChange={(e) => setSignInData({ ...signInData, name: e.target.value })}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={signInData.password}
            required
            onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
          />
          <br />
          <button>Sign In</button>
          {mess && <div className="message-box">{mess}</div>}
        </form>
      </div>

      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>To keep connected with us please login with your personal info</p>
            <br /><br />
            <button 
              className="ghost" 
              id="signIn" 
              onClick={() => setIsRightPanelActive(false)}
            >
              Sign In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello, User!</h1>
            <p>Enter your personal details and start journey with us</p>
            <button 
              className="ghost" 
              id="signUp" 
              onClick={() => setIsRightPanelActive(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Display the message */}
      
    </div>
  );
};

export default Login;
