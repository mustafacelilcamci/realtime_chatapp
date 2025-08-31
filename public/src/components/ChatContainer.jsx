import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute, getAuthHeaders } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem("user")
    );
    const response = await axios.post(recieveMessageRoute, {
      from: data._id,
      to: currentChat._id,
    }, {
      headers: getAuthHeaders()
    });
    setMessages(response.data.messages || response.data);
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem("user")
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = async (msg, imageFile) => {
    const data = await JSON.parse(
      localStorage.getItem("user")
    );
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('to', currentChat._id);
    if (msg) {
      formData.append('message', msg);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    try {
      const response = await axios.post(sendMessageRoute, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.status) {
        const newMessage = {
          fromSelf: true,
          message: response.data.message.message,
          time: new Date(),
          _id: response.data.message._id
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Emit socket event for real-time messaging
        socket.current.emit("send-msg", {
          to: currentChat._id,
          from: data._id,
          msg: response.data.message.message
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderMessage = (message) => {
    const { text, image, type } = message.message;
    
    return (
      <div className="message-content">
        {text && <p>{text}</p>}
        {image && (
          <div className="message-image">
            <img 
              src={`http://localhost:5000${image}`} 
              alt="Message" 
              onClick={() => window.open(`http://localhost:5000${image}`, '_blank')}
            />
          </div>
        )}
        <span className="time">{new Date(message.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
    );
  };

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={currentChat.avatarImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
              alt=""
            />
          </div>
          <div className="user-info">
            <h3>{currentChat.username}</h3>
            <p>Online</p>
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                {renderMessage(message)}
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0;
  overflow: hidden;
  background-color: #efeae2;
  
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background-color: #f0f2f5;
    border-bottom: 1px solid #e9edef;
    
    .user-details {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .avatar {
        img {
          height: 40px;
          width: 40px;
          border-radius: 50%;
          object-fit: cover;
        }
      }
      
      .user-info {
        h3 {
          color: #111b21;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 2px 0;
        }
        
        p {
          color: #25D366;
          font-size: 12px;
          margin: 0;
          font-weight: 500;
        }
      }
    }
  }
  
  .chat-messages {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23f0f2f5" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23f0f2f5" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="%23f0f2f5" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="%23f0f2f5" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="%23f0f2f5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    
    &::-webkit-scrollbar {
      width: 6px;
      &-thumb {
        background-color: #c1c1c1;
        border-radius: 3px;
      }
      &-track {
        background-color: transparent;
      }
    }
    
    .message {
      display: flex;
      align-items: flex-end;
      margin-bottom: 8px;
      
      .message-content {
        max-width: 65%;
        overflow-wrap: break-word;
        padding: 8px 12px;
        font-size: 14px;
        border-radius: 8px;
        position: relative;
        
        p {
          margin: 0 0 4px 0;
          line-height: 1.4;
        }
        
        .message-image {
          margin: 4px 0;
          
          img {
            max-width: 100%;
            max-height: 300px;
            border-radius: 4px;
            cursor: pointer;
            transition: opacity 0.2s ease;
            
            &:hover {
              opacity: 0.8;
            }
          }
        }
        
        .time {
          font-size: 11px;
          opacity: 0.7;
          display: block;
          text-align: right;
          margin-top: 4px;
        }
        
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    
    .sended {
      justify-content: flex-end;
      
      .message-content {
        background-color: #d9fdd3;
        color: #111b21;
        border-bottom-right-radius: 2px;
      }
    }
    
    .recieved {
      justify-content: flex-start;
      
      .message-content {
        background-color: white;
        color: #111b21;
        border-bottom-left-radius: 2px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  }
`;
