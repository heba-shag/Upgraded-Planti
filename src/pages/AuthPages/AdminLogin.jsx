import {  useState } from "react";
import { FaCheckSquare, FaRegCheckSquare, FaRegUserCircle } from "react-icons/fa";
import { useStateContext } from "../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";
import './logInStyle.css';


export default function AdminLogIn(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");

    // multiple environment
    let isDev=process.env.NODE_ENV === 'development';
    const adminLoginApi = isDev? {
        baseLoginUrl: process.env.REACT_APP_API_LOGIN_URL,
        addLogin:()=>{return (`${adminLoginApi.baseLoginUrl}/Login`)},
    }:{
        baseLoginUrl: process.env.REACT_APP_API_LOGIN_URL,
        addLogin:()=>{return (`${adminLoginApi.baseLoginUrl}/Login`)},
    }

    let [emailError,setEmailError]=useState("");
    let navigation=useNavigate();
    //cookie
    let cookie=new Cookies();
    //context
    const UserNow=useStateContext();
console.log(adminLoginApi.addLogin());
    async function Submit(e){
        e.preventDefault();
        try{
            let res =await axios.post(adminLoginApi.addLogin(),{
                email:email,
                password: password,
            });

            let token=res.data.token.token;
            let userDetails=res.data;
            cookie.set("authData",userDetails);
            UserNow.setAuth({token,userDetails});
            console.log(UserNow);
            navigation('/ecommerce');
            
        }catch(err){
            console.log('hi');
            // setEmailError(err.response.data.errorMessage);
        }
    }
    return(
        <div className="register">
            <form onSubmit={Submit}>
                <div className="done-btn"  style={{textAlign:"center"}}>
                    <FaRegUserCircle className="icon"/>
                </div>
                

                        <div className="inputInfo adminInfo">
                            <label htmlFor="email">Email:</label>
                            <input id="email" placeholder="Email.." type="email" required value={email} onChange={(e)=> setEmail(e.target.value)}/>
                            {/* {accept && emailError===422 && (<p className="error">email is already been taken</p>)} */}
                        </div>

                        <div className="inputInfo adminInfo">
                            <label htmlFor="password">Password:</label>
                            <input id="password" placeholder="Enter password.." type="password" value={password} onChange={(e)=> setPassword(e.target.value)} />
                            {/* {password.length < 8 && accept && (<p className="error">should be 8 characters or more</p>)} */}
                        </div>
                
                

                <div className="done-btn"  style={{textAlign:"center"}}>
                    <button type="submit">login</button>
                </div>
            </form>
        </div>
    )
}