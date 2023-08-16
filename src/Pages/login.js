import React, { useState } from 'react';
import axios from 'axios';
import Signup from './signup';
import Forgot from './forgotPassword';
import { useNavigate } from 'react-router-dom';

export default function Logins({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);

  const navigate = useNavigate();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = {
      email: email,
    };
    axios
      .post('http://localhost:3004/api/loginOwners', { email, password })
      .then((response) => {
        onLogin(formData);
        navigate('/My-Cars');
        localStorage.setItem('loggedInUser', JSON.stringify(formData.id));
      })
      .catch((error) => {
        console.log(error);
        setError('No Account Found. Please try again.');
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgot = () => {
    setShowForgot(true);
    navigate('/forgot-Password');
  };

  const handleForgotLog = () => {
    setShowForgot(false);
  };

  const handleSignup = () => {
    setShowLoginForm(false);
    navigate('/signup');
  };

  return (
    <div>
      {showLoginForm ? (
        <div className="background-container">
        <div className="login-form">
          <h1>Login</h1>
          <form onSubmit={handleFormSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <br />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <br />
            <div>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={togglePasswordVisibility}
              />
              <label>Show Password</label>
            </div>
            {error && <p className="error" key="error-message">{error}</p>}
            <button type="submit">Login</button>
          </form>
          <div>
            <div onClick={handleForgot}>
              <p>Forgot Password?</p>
            </div>
          </div>
          <div>
            <p>
              Don't have an account? <button onClick={handleSignup}>Sign up</button>
            </p>
          </div>
        </div>
        </div>
      ) : (
        <div>
          <Signup onSignup={handleSignup} />
        </div>
      )}
      {showForgot && (
        <div>
          <Forgot onBack={handleForgotLog} />
        </div>
      )}
    </div>
  );
}
