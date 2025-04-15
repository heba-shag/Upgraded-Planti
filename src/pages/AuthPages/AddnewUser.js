import { useEffect, useState } from "react";
import axios from "axios";
import "../AuthPages/logInStyle.css";
import { FaCheckSquare, FaRegCheckSquare, FaRegUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-dropdown-select";
import { MdOutlineAddTask } from "react-icons/md";
import Cookies from "universal-cookie";
import { useStateContext } from "../../contexts/ContextProvider";

let UserType=[
    {value:0,label:"Admin"},
    {value:1,label:"Worker"},
    {value:2,label:"Engineer"},
    {value:3,label:"Accountant"},
    {value:4,label:"SuperAdmin"}, 
]

export default function AddNewUser(){
    let [fName,setFName]=useState("");
    let [lName,setLName]=useState("");
    let [email,setEmail]=useState("");
    let [password,setPassword]=useState("");
    let [phoneNum,setPhoneNum]=useState("");
    let [roleIds,setRoleIds]=useState([]);
    let [selectedRoles,setSelectedRoles]=useState("");
    let [passwordR,setPasswordR]=useState("");
    let [type,setType]=useState("");
    let [selectedTypeName,setSelectedTypeName]=useState("");
    
    let [roleName,setRoleName]=useState("");
    let [isTotalAccess,setIsTotalAccess]=useState(false);
    let [addRoleConfirmation, setAddRoleConfirmation] = useState(false);
    let [showDonemessage,setShowDoneMessage]=useState(false);
    let [runUseEffect,setRun]=useState(0);
    let UserNow=useStateContext();
    const token = UserNow.auth.token;
    const handleAddRole = async () => {
        setAddRoleConfirmation(true);
    };

    let [emailError,setEmailError]=useState("");
    let navigation=useNavigate();
    
    let isDev=process.env.NODE_ENV === 'development';
    const addUsersApi = isDev? {
        baseUsersUrl: process.env.REACT_APP_API_USERS_URL,
        addNewUser:()=>{return (`${addUsersApi.baseUsersUrl}/Add`)},

        baseRoleUrl: process.env.REACT_APP_API_ROLE_URL,
        
        getAllRole:()=>{return (`${addUsersApi.baseRoleUrl}/GetAll`)},
        addRole:()=>{return (`${addUsersApi.baseRoleUrl}/add`)},
    }:{
        baseUsersUrl: process.env.REACT_APP_API_USERS_URL,
        addNewUser:()=>{return (`${addUsersApi.baseUsersUrl}/Add`)},

        baseRoleUrl: process.env.REACT_APP_API_ROLE_URL,
        getAllRole:()=>{return (`${addUsersApi.baseRoleUrl}/GetAll`)},
        addRole:()=>{return (`${addUsersApi.baseRoleUrl}/add`)},
    }

    useEffect(()=>{
        axios.get(addUsersApi.getAllRole(),{
            headers:{
                Authorization:token
            }
        })
        .then((res)=>{
            if(res.status!==200){
                throw Error("couldn't fetch data for that resource" )
            }
            setRoleIds(res.data);
        })
        .catch(err=>{
            console.log(err.message);
        });
    },[runUseEffect]);

    const addRoleFunction = async()=> {
        try{
            let response=await axios.post(addUsersApi.addRole(),{
                title:roleName,
                fullAccess:isTotalAccess,
            },{
                headers:{
                    Authorization:token
                }
            });
            if(response.status===200){
                setAddRoleConfirmation(false);
                setRun((prev)=>prev+1);
                setShowDoneMessage(true); 
                setTimeout(() => setShowDoneMessage(false), 2000); 
            }else{
                console.error(`Failed to download file:`,response.status)
            }
        }catch(error){
            console.error("Error downloading file:",error.message);
        }
    }

    const cancelAddRole = () => {
        setAddRoleConfirmation(false);
    };

    const handleTypeChange = (event) => {
        setType(event.target.value);
        const selectedName = event.target.options[event.target.selectedIndex].dataset.type;
        setSelectedTypeName(selectedName);
    };

    const handleSetIsAccess=()=>{
        setIsTotalAccess(!isTotalAccess);
    }

    async function Submit(e){
        e.preventDefault();
        try{
            let res =await axios.post(addUsersApi.addNewUser(),{firstName:fName,
            lastName:lName,
            email:email,
            type:parseInt(type) ,
            password: password,
            phoneNumber:phoneNum,
            roleIdstoAdd:selectedRoles,
        },
            {headers: { Authorization: token} });

            navigation('/ecommerce');
            
        }catch(err){
            setEmailError(err.response.data.errorMessage);
        }
    }

    return(
        <>
            <div className="parent" >
                <button className="icon" onClick={()=>handleAddRole()}>< MdOutlineAddTask className="icon addTaskIcon" /></button>

                <img src='../Assets/greenWallpaper2.jpg' alt="" className="backgroundImg"/>
                <div className="register">
                    <form onSubmit={Submit}>
                        <div className="done-btn"  style={{textAlign:"center"}}>
                            <FaRegUserCircle className="icon"/>
                        </div>

                        <div className="inputInfo">
                            <label >First Name:</label> 
                            <input type="text" placeholder="Name.." value={ fName} onChange={(e)=>  setFName(e.target.value)} />
                            {/* { fName==="" && (<p className="error">this field required</p>)} */}
                        </div>

                        <div className="inputInfo">
                            <label>Last Name:</label> 
                            <input type="text" placeholder="Name.." value={ lName} onChange={(e)=>  setLName(e.target.value)} />
                        </div>

                        <div className="inputInfo">
                            <label htmlFor="email">Email:</label>
                            <input id="email" placeholder="Email.." type="email" required value={ email} onChange={(e)=>  setEmail(e.target.value)}/>
                            {/* {accept && emailError===422 && (<p className="error">email is already been taken</p>)} */}
                        </div>
                        
                        <div className="inputInfo">
                            <label htmlFor="password">Password:</label>
                            <input id="password" placeholder="Enter password.." type="password" value={ password} onChange={(e)=>  setPassword(e.target.value)} />
                            {/* {password.length < 8 && accept && (<p className="error">should be 8 characters or more</p>)} */}
                        </div>

                        <div className="inputInfo">
                            <label htmlFor="repeat">Repeat Password:</label>
                            <input id="repeat" placeholder="Repeat password.." type="password" value={ passwordR} onChange={(e)=>  setPasswordR (e.target.value)} />
                            {/* {passwordR!== password && accept && (<p className="error">password dosn't matches</p>)} */}
                        </div>
                            
                        <div className="inputInfo">
                            <label htmlFor="password">Type:</label>
                            <select value={ type}  onChange={ handleTypeChange}>
                                <option value="">Choose</option>
                                { UserType.map((option) => (<option key={option.value} value={option.value} data-type={option.label}>{option.label} </option>))}
                            </select>
                            {/* <input id="password" placeholder="Enter password.." type="password" value={password} onChange={(e)=> setPassword(e.target.value)} /> */}
                            {/* {password.length < 8 && accept && (<p className="error">should be 8 characters or more</p>)} */}
                        </div>


                        <div className="inputInfo">
                            <label >Roles:</label>
                            <Select multi options={ roleIds} labelField="title" valueField="id"  color="#528e25" value={ selectedRoles} onChange={(e) => { setSelectedRoles(e.map(option=>option.id))}}  /> 
                        </div>

                        <div className="done-btn"  style={{textAlign:"center"}}>
                            <button type="submit">Register</button>
                        </div>
                    </form>
                </div>
            </div>
            { addRoleConfirmation &&(
                <div className="delete-message flex">
                    <form className='message' >
                        <div className="addingRolemessage">

                            <div className="inputInfo">
                                <label className='sureMessage flex'>Role Adı?</label>
                                <input type="text" value={ roleName} onChange={(e)=> setRoleName(e.target.value)}  placeholder='Role Adı...'/>
                            </div>

                            <div className="inputInfo">
                                <label className='sureMessage flex'>is Full Access?</label>
                                <span className="icon" onClick={(e)=> handleSetIsAccess(e.target.value)}>{ isTotalAccess?<FaCheckSquare  />:<FaRegCheckSquare />}</span>
                            </div>

                        </div>
                        <div className='deleteFormBtns flex'>
                            <button type="button" className='no-btn' onClick={ cancelAddRole}>
                                iptal
                            </button>
                            <button type="button" className='no-btn' onClick={ addRoleFunction}>
                                indirmek!
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            { showDonemessage &&
                <div className="done-delete flex" style={{border: "0.2rem solid var(--PrimaryColor)"}}>
                    <p className='done-message flex'>başarıyla indirildi!</p>
                </div>
            }
        </>
    )
}