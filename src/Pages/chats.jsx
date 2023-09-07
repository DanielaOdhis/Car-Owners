import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Chats = () => {
  const [chatData, setChatData] = useState([]);
  const [selectedProfileChats, setSelectedProfileChats] = useState([]);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showInputField, setShowInputField] = useState(false);
  const [inputText, setInputText] = useState("");
  const [Ids, setIds]=useState([]);

  const userId = localStorage.getItem("loggedUser");
  console.log("User Id:", userId);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
 // const user__Id = localStorage.getItem('user_Id');

 useEffect(() => {
  fetch('/chats.json')
    .then(response => response.json())
    .then(data => {
      setChatData(data);
      const userIds = data.map(chat => chat.userId);
    console.log("UserIds:", userIds);
    setIds(userIds);
      const userId = data.find(chat => chat.userId)?.userId;
      if (userId) {
        localStorage.setItem('user_Id', userId);
      }
    })
    .catch(error => console.error('Error fetching chat data:', error));
}, []);

  const socket = new WebSocket(`ws://localhost:9600/ws/${userId}`);
  // Connection opened
  socket.onopen=(event)=>{
    socket.send(JSON.stringify(Ids));
    console.log("connection successful",event);
  event.preventDefault();
}
 //const clientID = "101a";
 let recepientId = queryParams.get('user_Id');
 console.log("Recipient ID:", recepientId);

  socket.onmessage=(event) => {
    console.log("Message from server: ", event.data);
    const msg=JSON.parse(event.data);
    console.log("alaaa", msg);
    event.preventDefault();
  };


    useEffect(() => {
    const handleEscapeKeyPress = (e) => {
      if (e.key === 'Escape') {
        setShowProfilePopup(false);
        setSelectedProfileChats([]);
        setShowInputField(false);
        navigate('/chats');
        setInputText("");
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
     setInputText("");
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
            // create a new message object
         let message = {
           recepientId: recepientId,
           message: inputText.trim(),
         };
         // convert the message object to JSON and send it to the server
         socket.send(JSON.stringify(message));
       setInputText("");
     }
   }

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
                  <span className="clickable-message"
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
         <div className="cht">
        {selectedProfileChats.map((message, index) => (
          <div key={index} className={`chat-message ${message.senderId === 1 ? 'S-sent' : 'R-received'}`}>
           <div className={message.senderId === 1 ? "me" : "you"}>
  {message.senderId === 1 ? (
    <div>
  <svg xmlns="http://www.w3.org/2000/svg" width="224" height="72" viewBox="0 0 224 72" fill="none">
  <g filter="url(#filter0_i_14_93)">
    <path d="M0 15C0 6.71573 6.71573 0 15 0H209C217.284 0 224 6.71573 224 15V72L214.813 59.92C211.977 56.19 207.56 54 202.874 54H30.4889H15C6.71573 54 0 47.2843 0 39V15Z" fill="#9B8079"/>
  </g>
  <defs>
    <filter id="filter0_i_14_93" x="0" y="-6.91" width="224" height="78.91" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="-6.91"/>
      <feGaussianBlur stdDeviation="3.455"/>
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0"/>
      <feBlend mode="normal" in2="shape" result="effect1_innerShadow_14_93"/>
    </filter>
  </defs>
  <text x="10" y="40" fill="black">
        {message.message}
      </text>
      <text x="10" y="70" fill="white" className="message-time">
        {message.time}
      </text>
</svg>
<div className="circle-container">
<svg width="30" height="30">
        <circle cx="15" cy="15" r="8" fill={message.status === 'sent' ? 'orange' : message.status === 'delivered' ? 'green' : message.status === 'read' ? 'purple' : 'red'} />
        <circle cx="15" cy="15" r="10" fill="transparent" stroke="grey" strokeWidth="2" />
      </svg>
    </div>
</div>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="210" height="87" viewBox="0 0 210 87" fill="none">
    <g filter="url(#filter0_i_14_88)">
      <path d="M0 15C0 6.71573 6.71573 0 15 0H195C203.284 0 210 6.71573 210 15V50.1575C210 58.4418 203.284 65.1575 195 65.1575H21.7818C16.582 65.1575 11.7531 67.8505 9.02038 72.2743L0 86.8767V15Z" fill="#4B4A48"/>
    </g>
    <defs>
      <filter id="filter0_i_14_88" x="0" y="-6.91" width="210" height="250" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="-6.91"/>
        <feGaussianBlur stdDeviation="3.455"/>
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0"/>
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_14_88"/>
      </filter>
    </defs>
    <text x="10" y="40" fill="white" text-wrap="wrap" >
      {message.message}
    </text>
  </svg>
  )}
</div>

        </div>
        ))}
        </div>
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
        e.preventDefault();
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
