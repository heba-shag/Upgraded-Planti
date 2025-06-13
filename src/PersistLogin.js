import axios from "axios"
import { useContext, useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
// import Loading from "../Loading";
import Cookies from "universal-cookie";
import { useStateContext } from "./contexts/ContextProvider";
import Loading from "./components/Loading";

export default function PersistLogin(){
    let UserNow=useStateContext();
    let [nowDate,setNowDate]=useState(new Date().toISOString());
    let [loading,setLoading]=useState(true);

    // cookie
    let cookie=new Cookies();
    let getToken=cookie.get("authData");
    console.log(getToken); 
    useEffect(()=>{
        async function refresh() {
            try{
                await axios.post(`http://staging-cultivation.runasp.net/api/Login/RefreshToken?RefreshToken=${getToken.token.refreshToken}`
                ,null,{
                    headers:{
                        Authorization:getToken.token.token
                    }
                })
                .then((data)=>{
                    console.log(data);
                    cookie.set("authData",data);
                    UserNow.setAuth((prev) =>( {
                        // return{
                            ...prev,
                            token: data.token.token,
                            userDetails:data
                        // } 
                    }));
                })
                
            }
            catch (err){
                console.log(err);
            }
            finally{
                setLoading(false);
            }

        } 
        if (!getToken.token.refreshToken) {
            setLoading(false);
            return;
        } 

        if (getToken?.token?.expireDate > nowDate) {
            refresh();
        } else {
            setLoading(false);
        }

    },[nowDate, getToken, UserNow]);
    return loading? <Loading/>:<Outlet/>
}