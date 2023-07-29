import React, { useState } from 'react';

export default function Forgot({ onBack }) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setIsSubmitted(true);

    setEmail('');
    setError('');
  };

  const handleLoginClick = () => {
    onBack();
  };

  return (
    <div className="forgot">
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
  );
}
