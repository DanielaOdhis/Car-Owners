import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Chats = () => {
  const [chatData, setChatData] = useState([]);
  const [selectedProfileChats, setSelectedProfileChats] = useState([]);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showInputField, setShowInputField] = useState(false);
  const [inputText, setInputText] = useState("");

  const userId = localStorage.getItem("loggedUser");
  console.log("User Id:", userId);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
 // const user__Id = localStorage.getItem('user_Id');

  const socket = new WebSocket("ws://localhost:9600/ws/{userId}");
  // Connection opened
  socket.onopen=(event)=>{console.log("connection successful",event);
}
 const clientID = "101a";
 let recepientId = queryParams.get('user_Id');
 console.log("Recipient ID:", recepientId);

  socket.onmessage=(event) => {
    console.log("Message from server: ", event.data);
  };

  useEffect(() => {
    fetch('/chats.json')
      .then(response => response.json())
      .then(data => {
        setChatData(data);
        const userId = data.find(chat => chat.userId)?.userId;
        if (userId) {
          localStorage.setItem('user_Id', userId);
        }
      })
      .catch(error => console.error('Error fetching chat data:', error));
  }, []);

    useEffect(() => {
    const handleEscapeKeyPress = (e) => {
      if (e.key === 'Escape') {
        setShowProfilePopup(false);
        setSelectedProfileChats([]);
        setShowInputField(false);
        navigate('/chats');
      }
    };

    document.addEventListener('keydown', handleEscapeKeyPress);

    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress);
    };
  }, [navigate]);

  const handleLastMessageClick = (Chats) => {
    const profileChats = Chats.messages;
     setSelectedProfileChats(profileChats);
     setShowInputField(true);
     console.log("Chat Clicked::" , profileChats);
     navigate(`/chats?user_Id=${Chats.userId}`);
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

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendClick();
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
                    onClick={() => {
    console.log('Message clicked-User Id:', chat.userId);
    handleLastMessageClick(chat);
  }}
                  >
                    {chat.messages[chat.messages.length - 1].message}
                  </span>
                </p>
              </div>
              <p className="time">{chat.messages[chat.messages.length - 1].time}</p>
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
          <p>{message.message} </p>
          <p className="message-status message-time">{message.status} {message.time}</p>
        </div>
        ))}
        {showInputField && (
          <div>
          <div className="input-field">
            <input type="text"
            className="input"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e)=>{ if(e.key === 'Enter'){if(e.target.value.trim() !==""){
           // create a new message object
        let message = {
          recepientId: recepientId,
          message: e.target.value.trim(),
        };
        // convert the message object to JSON and send it to the server
        socket.send(JSON.stringify(message));
          // socket.send(e.target.value.trim())};
          e.target.value=""} } }} 
          onKeyPress={handleInputKeyPress}/>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
