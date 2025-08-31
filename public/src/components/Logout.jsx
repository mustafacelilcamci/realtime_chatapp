import React from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import styled from "styled-components";

export default function Logout() {
  const navigate = useNavigate();
  
  const handleClick = async () => {
    try {
      // Clear localStorage
      localStorage.clear();
      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, clear localStorage and navigate
      localStorage.clear();
      navigate("/login");
    }
  };
  
  return (
    <Button onClick={handleClick} title="Logout">
      <BiPowerOff />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e9edef;
  }
  
  svg {
    font-size: 20px;
    color: #54656f;
  }
`;
