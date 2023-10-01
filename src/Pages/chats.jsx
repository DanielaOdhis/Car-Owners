import React, { useState, useEffect, useRef} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';

const Chats = () => {
 // let chat_data = [];
  const chatDataRef = useRef([]);
  const [selectedProfileChats, setSelectedProfileChats] = useState([]);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showInputField, setShowInputField] = useState(false);
  const [inputText, setInputText] = useState("");
  const [Ids, setIds]=useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

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
      chatDataRef.current = data;
      let testMessage = {senderId:"1", message:"bro, let us get this straight. like why the hell won't you just wrap yourself to the next line like normal people do", "msg_id":"145645","status":"read","time":"8:11 am"};
       console.log("ChatDataRef: ", chatDataRef);
      console.log("Chats: ", chatDataRef.current[0].messages.push(testMessage));
      console.log("Chats: ", chatDataRef.current[0].messages);
      console.log("Chats Type: ", typeof(chatDataRef.current));
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

  const socket = new WebSocket(`ws://54.173.222.55:9600/ws/${userId}`);
  // Connection opened
  socket.onopen=(event)=>{
    socket.send(JSON.stringify(Ids));
    console.log("connection successful",event);
  event.preventDefault();
}
 //const clientID = "101a";
 const recepientId = queryParams.get('user_Id');
 console.log("Recipient ID:", recepientId);

 socket.onmessage=(event) => {
  console.log("Message from server: ", event.data);
  const msg=JSON.parse(event.data);
  if ('message' in msg){
const msgUpdate = {
  message: msg.message,
  msg_id:msg.msg_id,
  senderId: msg.senderId,
  time:new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: "2-digit", hour12: true }),
};
for (const chat in chatDataRef.current){
  console.log("chatDataRef UID", chatDataRef.current[chat].userId);
   console.log("And the recepientId: ",recepientId);
if(chatDataRef.current[chat].userId==recepientId){
   console.log("Updated:...",chatDataRef.current[chat].messages.push(msgUpdate))

break;
}
}
}else if('onlineStatus' in msg){
  console.log("online status: ", msg)
  for (const chat in chatDataRef.current){
    if(chatDataRef.current[chat].userId==msg.userId){
      console.log("online_status Last update: ", msg.onlineStatus.last_updated);
      chatDataRef.current[chat].online_status = msg.onlineStatus.status;
    }
  }
}else if('msg_id' in msg){
  console.log("message status: ",msg);
    for (const chat in chatDataRef.current){
      console.log("In the for loop now: ",chat);
      console.log("Are we entering the second loop? ",chatDataRef.current[chat].userId==msg.recepient_id);
   if(chatDataRef.current[chat].userId==msg.recepient_id){
      console.log("Entering second loop");
      console.log("All messages:",chatDataRef.current[chat].messages);
   for (const message in chatDataRef.current[chat].messages){
      console.log("The actual message",chatDataRef.current[chat].messages[message]);
      console.log("Message id: ",chatDataRef.current[chat].messages[message].msg_id);
      console.log('msg id ni: ',msg.msg_id);
      console.log("Is this message the one we need to update?",message.msg_id == msg.msg_id)
     if(chatDataRef.current[chat].messages[message].msg_id == msg.msg_id){
       chatDataRef.current[chat].messages[message].status = msg.status;
       console.log("in message id",chatDataRef.current[chat].messages[message].status)
       console.log("MSG_ID::", msg.msg_id);
       break;
     }
   }
  break;
 }
 }
 }else{
   console.log("Weird message: " ,msg);
 }
event.preventDefault();
};

useEffect(() => {
    const handleEscapeKeyPress = (e) => {
      if (e.key === 'Escape') {
        setShowProfilePopup(false);
        setSelectedProfileChats([]);
        setShowInputField(false);
        setSelectedChatUser(false);
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
     for (const chat in chatDataRef.current){
      console.log("this should log once the chat is clicked");
console.log("the recepientId of the clicked chat is: ", recepientId)
      if(chatDataRef.current[chat].userId==recepientId){
        console.log("found the correct chat");
        for (const message in chatDataRef.current[chat].messages){
    console.log("Current msg status",chatDataRef.current[chat].messages[message].status );
     if(chatDataRef.current[chat].messages[message].status == undefined){
            console.log("the message is",chatDataRef.current[chat].messages[message]);
            const msg_status_update={
              recepientId: userId,
              msg_status:'read',
              sender_id:recepientId,
              msg_id:chatDataRef.current[chat].messages[message].msg_id
            }
           console.log("status update: ",msg_status_update);
socket.send(JSON.stringify(msg_status_update))
          }
        }
      }
    }
     setInputText("");
     setSelectedChatUser({ username: Chats.username, online_status:Chats.online_status});
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
       console.log("lee:", userId)
            // create a new message object
         let message = {
          senderId: userId,
           recepientId: recepientId,
           message: inputText.trim(),
           msg_id:uuidv4(),
           status: 'sent',
         };
          console.log("Chat Data Ref:" ,chatDataRef)
          console.log("UUIDVV", uuidv4);
         socket.send(JSON.stringify(message));
        let msgUpdate = {
            senderId: message.senderId, message: message.message,msg_id:message.msg_id ,status:message.status,time:new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit", hour12: true })
        };
       for (const chat in chatDataRef.current){
        console.log("We got the chat", chat)
        if(chatDataRef.current[chat].userId==recepientId){
          chatDataRef.current[chat].messages.push(msgUpdate);
          }
}
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

        {chatDataRef.current.map((chat, index) => (
          <div className="chat" key={index}>

            <div className="profile-info">
            <div className="circle">
        <svg width="30" height="30">
        <circle cx="15" cy="15" r="8" fill={chat.online_status === true ? 'green'  : 'grey'} />
        <circle cx="15" cy="15" r="10" fill="transparent" stroke="black" strokeWidth="2" />
      </svg>
        </div>
            <img
              src={chat.profile}
              alt="Profile"
              className="profile-image"
              onClick={handleProfileClick}
            />
        </div>

            <div className="chat-content">
              <div className="chat-details">
                <h3 className="username"  onClick={() => {
    console.log('Message clicked-User Id:', chat.userId);
    handleLastMessageClick(chat);
  }}>{chat.username}</h3>
                <p
                  className={`m-message ${
                    chat.messages[chat.messages.length - 1].senderId === userId ? 'sent' : 'received'
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

      <div className="chat-list-content" >
        {/*showProfilePopup && selectedProfileChats && -- ${showProfilePopup ? 'blurred' : ''}--} (
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
        )*/}

        <h1>Let's Chat</h1>
         <div className="cht">
         {selectedChatUser && (
  <div className="chat-header">
      <div className="username-t">Chat with {selectedChatUser.username}</div>
  </div>
)}
        {selectedProfileChats.map((message, index) => (
          <div key={index} className={`chat-message ${message.senderId === userId ? 'S-sent' : 'R-received'}`}>
           <div className={message.senderId === userId ? "me" : "you"}>
  {message.senderId === userId ? (
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
  <foreignObject x="10" y="5" width="200" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" >
                A good example of a paragraph contains a topic sentence, details and a conclusion. 'There are many different kinds of animals that live in China. Tigers and leopards are animals that live in China's forests in the north. In the jungles, monkeys swing in the trees and elephants walk through the brush.
              </div>
            </foreignObject>
      <text x="10" y="70" fill="white" className="message-time">
        {message.time}
      </text>
</svg>
<div className="circle-container">
<svg width="30" height="30">
        <circle cx="15" cy="15" r="8" fill={message.status === 'sent' ? 'orange' : message.status == 'delivered' ? 'green' : message.status == 'read' ? 'purple' : 'red'} />
        <circle cx="15" cy="15" r="10" fill="transparent" stroke="grey" strokeWidth="2" />
      </svg>
    </div>
</div>
  ) : (
    <div>
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
    <tspan x="10" dy="0"> {message.message}</tspan>
    </text>
    <text x="25" y="80" fill="white" className="message-time">
        {message.time}
      </text>
  </svg>
    </div>
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
            onKeyDown={handleInputKeyPress}
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