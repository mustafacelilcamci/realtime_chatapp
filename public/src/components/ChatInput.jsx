import React, { useState, useRef } from "react";
import styled from "styled-components";
import { IoSend } from "react-icons/io5";
import { IoImage } from "react-icons/io5";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const sendChat = async (event) => {
    event.preventDefault();
    if (msg.length > 0 || selectedImage) {
      await handleSendMsg(msg, selectedImage);
      setMsg("");
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container>
      <form onSubmit={(event) => sendChat(event)}>
        <div className="input-container">
          <input
            type="text"
            placeholder="Type a message..."
            onChange={(e) => setMsg(e.target.value)}
            value={msg}
          />
          
          <div className="action-buttons">
            <button
              type="button"
              className="image-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Send image"
            >
              <IoImage />
            </button>
            
            <button type="submit" className="send-btn" title="Send message">
              <IoSend />
            </button>
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button type="button" onClick={removeImage} className="remove-btn">
              ×
            </button>
          </div>
        )}
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f2f5;
  padding: 16px 20px;
  border-top: 1px solid #e9edef;
  
  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .input-container {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border-radius: 8px;
    padding: 8px 12px;
    border: 1px solid #e9edef;
    
    input[type="text"] {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      background: transparent;
      
      &::placeholder {
        color: #667781;
      }
    }
    
    .action-buttons {
      display: flex;
      gap: 4px;
      
      button {
        background: none;
        border: none;
        padding: 8px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: #f0f2f5;
        }
        
        &.image-btn {
          color: #25D366;
          font-size: 20px;
        }
        
        &.send-btn {
          color: #25D366;
          font-size: 18px;
        }
      }
    }
  }
  
  .image-preview {
    position: relative;
    display: inline-block;
    max-width: 200px;
    
    img {
      width: 100%;
      height: auto;
      border-radius: 8px;
      border: 1px solid #e9edef;
    }
    
    .remove-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      
      &:hover {
        background: #c82333;
      }
    }
  }
`;
