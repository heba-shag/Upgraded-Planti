import { useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { useStateContext } from "../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";
import '../AuthPages/logInStyle.css';

export default function AdminLogIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [accept, setAccept] = useState(false);
    
    // Multiple environment setup
    const isDev = process.env.NODE_ENV === 'development';
    const adminLoginApi = {
        baseLoginUrl:isDev? process.env.REACT_APP_API_LOGIN_URL:process.env.REACT_APP_API_LOGIN_URL,
        addLogin: () => `${adminLoginApi.baseLoginUrl}/Login`
    };

    const navigation = useNavigate();
    const cookie = new Cookies();
    const UserNow = useStateContext();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setEmailError(null); // إزالة رسالة الخطأ عند التعديل
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setPasswordError(null); // إزالة رسالة الخطأ عند التعديل
    };

    async function Submit(e) {
        e.preventDefault();
        setAccept(true);
        
        try {
            const res = await axios.post(adminLoginApi.addLogin(), {
                email: email,
                password: password,
            });

            const token = res.data.token.token;
            const userDetails = res.data;
            
            cookie.set("authData", userDetails);
            UserNow.setAuth({ token, userDetails });
            navigation('/ecommerce');
            
        } catch (err) {
            console.log(err.response?.status);
            if (err.response?.status === 404) {
                setEmailError("Email does not exist");
            } else if (err.response?.status === 400) {
                setPasswordError("Wrong Password");
            }
        }
    }

    return (
        <div className='parent'>
            <div className="register">
                <form onSubmit={Submit}>
                    <div className="done-btn" style={{ textAlign: "center" }}>
                        <FaRegUserCircle className="icon" />
                    </div>

                    <div className="inputInfo adminInfo">
                        <label htmlFor="email">Email:</label>
                        <input 
                            id="email" 
                            placeholder="Email.." 
                            type="email" 
                            required 
                            value={email} 
                            onChange={handleEmailChange} 
                        />
                        {emailError && (
                            <p className="error">{emailError}</p>
                        )}
                    </div>

                    <div className="inputInfo adminInfo">
                        <label htmlFor="password">Password:</label>
                        <input 
                            id="password" 
                            placeholder="Enter password.." 
                            type="password" 
                            value={password} 
                            onChange={handlePasswordChange} 
                        />
                        {passwordError && (
                            <p className="error">{passwordError}</p>
                        )}
                    </div>

                    <div className="done-btn" style={{ textAlign: "center" }}>
                        <button type="submit">Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
}