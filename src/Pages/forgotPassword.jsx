import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const navigate=useNavigate();

  const handleSubmit = (e) => {

    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setIsSubmitted(true);

    setEmail('');
    setError('');
    e.preventDefault();
  };

  const handleLoginClick = () => {
    navigate('/');
  };

  return (
    <div className="background-container">
    <div className="forgot">
      <div className="forgot-container">
      <h1>Forgot Password</h1>
      {isSubmitted ? (
        <>
          <p className="success-message">
            An email with password reset instructions has been sent to your email address.
          </p>
          <button onClick={handleLoginClick}>Login</button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
    </div>
    </div>
  );
}
