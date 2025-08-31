import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host, getAuthHeaders } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
    
      navigate("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      setCurrentUser(user);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);
  
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(allUsersRoute, {
            headers: getAuthHeaders()
          });
          
          if (response.data.status) {
            setContacts(response.data.users);
          } else {
            console.error("Failed to fetch users:", response.data.msg);
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          if (error.response?.status === 401) {
            localStorage.clear();
            navigate("/login");
          }
        }
      }
    };
    
    fetchUsers();
  }, [currentUser, navigate]);
  
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  
  return (
    <>
      <Container>
        <div className="chat-container">
          <Contacts contacts={contacts} changeChat={handleChatChange} />
          {currentChat === undefined ? (
            <div className="main-content">
              <div className="top-bar">
                <div className="user-info">
                  {currentUser && (
                    <>
                      <span>Welcome, {currentUser.username}</span>
                      <div className="actions">
                        <button onClick={handleLogout} className="logout-btn">
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Welcome />
            </div>
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket} />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
  
  .chat-container {
    height: 95vh;
    width: 95vw;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    display: grid;
    grid-template-columns: 30% 70%;
    overflow: hidden;
    
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
    
    @media screen and (max-width: 720px) {
      grid-template-columns: 1fr;
      height: 100vh;
      width: 100vw;
      border-radius: 0;
    }
    
    .main-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      
      .top-bar {
        background: #f0f2f5;
        padding: 12px 20px;
        border-bottom: 1px solid #e9edef;
        
        .user-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          span {
            color: #111b21;
            font-size: 14px;
            font-weight: 500;
          }
          
          .actions {
            display: flex;
            gap: 8px;
            
            button {
              padding: 6px 12px;
              border: none;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              
              &.logout-btn {
                background: #dc3545;
                color: white;
                
                &:hover {
                  background: #c82333;
                }
              }
            }
          }
        }
      }
    }
  }
`;
