import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

export default function Settings({ onLogout, onProfileClick, onDeleteAccount, user, onUpload, onBookedClick }) {
  const [showPrompt, setShowPrompt] = useState(false);

  const navigate=useNavigate();

  const handlePrompt = () => {
    setShowPrompt(true);
  };

  const handleCancel = () => {
    setShowPrompt(false);
  };

  const handleProfile=()=>{
    navigate('/profile');
    onProfileClick();
  }

  const handleUpload =()=>{
    navigate('/uploads');
    onUpload();
  }

  const logOut = () => {
    navigate('/');
    onLogout();
  }

  const handleBook =()=>{
    navigate('/Booked-Cars');
    onBookedClick();
  }

  const handleChats = () => {
    navigate('/chats');
  }

  return (
    <div>
      <div className="settings-dropdown">
        <ul>
          <li onClick={handleProfile}>Profile</li>
          <li onClick={handleUpload}>Upload Cars</li>
          <li onClick={handleBook}>Booked Cars</li>
          <li onClick={handleChats}>Chats</li>
          <li onClick={logOut}>Log Out</li>
          <li onClick={handlePrompt}>Delete Account</li>
        </ul>
      </div>
      {showPrompt && (
        <div className="delete-prompt">
          <p>Are you sure you want to delete your account?</p>
          <button onClick={onDeleteAccount}>Yes</button>
          <button onClick={handleCancel}>No</button>
        </div>
      )}
    </div>
  );
}
