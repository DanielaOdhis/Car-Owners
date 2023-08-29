import React, { useState, useEffect } from 'react';

const Chats = () => {
  const [chatData, setChatData] = useState([]);
  const [selectedProfileChats, setSelectedProfileChats] = useState([]);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showInputField, setShowInputField] = useState(false);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    fetch('/chats.json')
      .then(response => response.json())
      .then(data => setChatData(data))
      .catch(error => console.error('Error fetching chat data:', error));
  }, []);

    useEffect(() => {
    const handleEscapeKeyPress = (e) => {
      if (e.key === 'Escape') {
        setShowProfilePopup(false);
        setSelectedProfileChats([]);
        setShowInputField(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKeyPress);

    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress);
    };
  }, []);

  const handleLastMessageClick = (profileChats) => {
    setSelectedProfileChats(profileChats);
    setShowInputField(true);
    console.log("Chat Clicked");
  };

  const handleProfileClick = () => {
    setShowProfilePopup(!showProfilePopup);
  };

   const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendClick = () => {
    if (inputText) {
      console.log("User typed:", inputText);
      setInputText("");
    }
  };

  return (
    <div className="chat-list-container">
      <div className="chat-list">
        {chatData.map((chat, index) => (
          <div className="chat" key={index}>
            <img
              src={chat.profile}
              alt="Profile"
              className="profile-image"
              onClick={handleProfileClick}
            />
            <div className="chat-content">
              <div className="chat-details">
                <h3 className="username">{chat.username}</h3>
                <p
                  className={`message ${
                    chat.messages[chat.messages.length - 1].senderId === 1 ? 'sent' : 'received'
                  }`}
                >
                  <span
                    className="clickable-message"
                    onClick={() => handleLastMessageClick(chat.messages)}
                  >
                    {chat.messages[chat.messages.length - 1].message}
                  </span>
                </p>
              </div>
              <p className="time">{chat.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={`chat-list-content ${showProfilePopup ? 'blurred' : ''}`}>
        {showProfilePopup && selectedProfileChats && (
          <div className="profile-popup-overlay" >
            <div className="profile-popup">
              <div className="profile-popup-content">
                <img
                  src={selectedProfileChats.profile}
                  alt="Profile"
                  className="profile-popup-image"
                />
              </div>
            </div>
          </div>
        )}
        <h1>Let's Chat</h1>
        {selectedProfileChats.map((message, index) => (
          <div key={index} className={`chat-message ${message.senderId === 1 ? 'S-sent' : 'R-received'}`}>
            {message.message}
          </div>
        ))}
        {showInputField && (
          <div className="input-field">
            <input type="text" className="input"  value={inputText}  onChange={handleInputChange}/>
           {inputText && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="send-icon"
                onClick={handleSendClick}
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
