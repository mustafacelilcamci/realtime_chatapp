import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerRoute } from "../utils/APIRoutes";

export default function Register() {
  const navigate = useNavigate();
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = values;
    if (password !== confirmPassword) {
      toast.error(
        "Password and confirm password should be same.",
        toastOptions
      );
      return false;
    } else if (username.length < 3) {
      toast.error(
        "Username should be greater than 3 characters.",
        toastOptions
      );
      return false;
    } else if (password.length < 8) {
      toast.error(
        "Password should be equal or greater than 8 characters.",
        toastOptions
      );
      return false;
    } else if (email === "") {
      toast.error("Email is required.", toastOptions);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      const { email, username, password } = values;
      try {
        const { data } = await axios.post(registerRoute, {
          username,
          email,
          password,
        });

        if (data.status === false) {
          toast.error(data.msg, toastOptions);
        }
        if (data.status === true) {
          // Store token and user data
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/");
        }
      } catch (error) {
        console.error("Registration error:", error);
        toast.error("Registration failed. Please try again.", toastOptions);
      }
    }
  };

  return (
    <>
      <FormContainer>
        <div className="register-container">
          <div className="register-header">
            <div className="whatsapp-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </div>
            <h1>Create Account</h1>
            <p>Join WhatsApp Web</p>
          </div>
          
          <form action="" onSubmit={(event) => handleSubmit(event)}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                name="username"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                name="email"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                name="password"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <button type="submit">Create Account</button>
            <div className="login-link">
              <span>
                Already have an account? <Link to="/login">Sign In</Link>
              </span>
            </div>
          </form>
        </div>
      </FormContainer>
      <ToastContainer />
    </>
  );
}

const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .register-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 100%;
    max-width: 400px;
    margin: 20px;
  }

  .register-header {
    text-align: center;
    margin-bottom: 30px;
    
    .whatsapp-icon {
      margin-bottom: 16px;
      
      svg {
        width: 48px;
        height: 48px;
      }
    }
    
    h1 {
      color: #128C7E;
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    
    p {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .input-group {
    position: relative;
    
    input {
      width: 100%;
      padding: 16px 20px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
      box-sizing: border-box;
      
      &:focus {
        outline: none;
        border-color: #25D366;
        box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
      }
      
      &::placeholder {
        color: #999;
      }
    }
  }
  
  button {
    background: #25D366;
    color: white;
    padding: 16px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #128C7E;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  .login-link {
    text-align: center;
    
    span {
      color: #666;
      font-size: 14px;
      
      a {
        color: #25D366;
        text-decoration: none;
        font-weight: 600;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
`;
