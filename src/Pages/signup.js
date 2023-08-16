import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup({ onSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = {
      email: email,
    };
    onSignUp(formData);
    // Check if any field is empty
    if (!username || !password || !email || !firstName || !lastName || !phoneNumber) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    const userData = { username, email, password, firstName, lastName, phoneNumber };

    fetch('http://localhost:3004/api/signupOwners', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        onSignUp(email); // Pass the email value to the onSignUp function
        navigate('/My-Cars');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin=()=>{
    navigate('/');
  }

  return (
    <div>
        <div className="background-container">
      <div className="signup-form">
        <h1>Sign Up</h1>
    <form onSubmit={handleFormSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      /><br /><br />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      /><br /><br />
      <input
        type="text"
        placeholder="Telephone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      /><br /><br />
      <input
        type="tel"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br /><br />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />
      <div>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={togglePasswordVisibility}
        />
        <label>Show Password</label>
      </div>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <button type="submit">Signup</button>
      <div>
        <p>Already have an Account?
          <button onClick={handleLogin}>Login</button>
        </p>
      </div>
    </form>
    </div>
    </div>
    </div>
  );
}
