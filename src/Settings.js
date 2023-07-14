import React, { useState } from 'react';

export default function Settings({ onLogout, onProfileClick, onDeleteAccount, user }) {
  const [showPrompt, setShowPrompt] = useState(false);

  const handlePrompt = () => {
    setShowPrompt(true);
  };

  const handleCancel = () => {
    setShowPrompt(false);
  };

  return (
    <div>
      <div className="settings-dropdown">
        <ul>
          <li onClick={onProfileClick}>Profile</li>
          <li onClick={onLogout}>Log Out</li>
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
