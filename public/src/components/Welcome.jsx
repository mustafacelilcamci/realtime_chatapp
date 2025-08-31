import React, { useState, useEffect } from "react";
import styled from "styled-components";

export default function Welcome() {
  const [userName, setUserName] = useState("");
  useEffect(async () => {
    setUserName(
      await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      ).username
    );
  }, []);
  return (
    <Container>
      <div className="welcome-content">
        <div className="whatsapp-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </div>
        <h1>
          Welcome, <span>{userName}!</span>
        </h1>
        <p>Select a chat to start messaging</p>
        <div className="features">
          <div className="feature">
            <div className="feature-icon">💬</div>
            <span>Real-time messaging</span>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <span>End-to-end encryption</span>
          </div>
          <div className="feature">
            <div className="feature-icon">📱</div>
            <span>Cross-platform sync</span>
          </div>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  height: 100%;
  
  .welcome-content {
    text-align: center;
    max-width: 400px;
    padding: 40px 20px;
    
    .whatsapp-icon {
      margin-bottom: 24px;
      
      svg {
        width: 80px;
        height: 80px;
      }
    }
    
    h1 {
      color: #111b21;
      font-size: 32px;
      font-weight: 600;
      margin: 0 0 12px 0;
      
      span {
        color: #25D366;
      }
    }
    
    p {
      color: #667781;
      font-size: 16px;
      margin: 0 0 40px 0;
    }
    
    .features {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .feature {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        .feature-icon {
          font-size: 20px;
        }
        
        span {
          color: #111b21;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }
`;
