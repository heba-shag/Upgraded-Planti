import { useEffect, useState } from "react";
import axios from "axios";
import "../AuthPages/logInStyle.css";
import { FaCheckSquare, FaRegCheckSquare, FaRegUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-dropdown-select";
import { MdOutlineAddTask } from "react-icons/md";
import Cookies from "universal-cookie";
import { useStateContext } from "../../contexts/ContextProvider";

let UserType = [
    {value: 0, label: "Admin"},
    {value: 1, label: "Worker"},
    {value: 2, label: "Engineer"},
    {value: 3, label: "Accountant"},
    {value: 4, label: "SuperAdmin"}, 
];

export default function AddNewUser() {
    const [fName, setFName] = useState("");
    const [lName, setLName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNum, setPhoneNum] = useState("");
    const [roleIds, setRoleIds] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState("");
    const [passwordR, setPasswordR] = useState("");
    const [type, setType] = useState("");
    const [selectedTypeName, setSelectedTypeName] = useState("");
    const [roleName, setRoleName] = useState("");
    const [isTotalAccess, setIsTotalAccess] = useState(false);
    const [addRoleConfirmation, setAddRoleConfirmation] = useState(false);
    const [showDonemessage, setShowDoneMessage] = useState(false);
    const [runUseEffect, setRun] = useState(0);
    const [emailError, setEmailError] = useState("");
    
    const UserNow = useStateContext();
    const token = UserNow.auth.token;
    const navigation = useNavigate();

    const isDev = process.env.NODE_ENV === 'development';
    const addUsersApi = {
        baseUsersUrl: process.env.REACT_APP_API_USERS_URL,
        addNewUser: () => `${addUsersApi.baseUsersUrl}/Add`,
        baseRoleUrl: process.env.REACT_APP_API_ROLE_URL,
        getAllRole: () => `${addUsersApi.baseRoleUrl}/GetAll`,
        addRole: () => `${addUsersApi.baseRoleUrl}/add`,
    };

    useEffect(() => {
        axios.get(addUsersApi.getAllRole(), {
            headers: { Authorization: token }
        })
        .then((res) => {
            if(res.status !== 200) {
                throw Error("Couldn't fetch data for that resource");
            }
            setRoleIds(res.data);
        })
        .catch(err => {
            console.log(err.message);
        });
    }, [runUseEffect]);

    const handleAddRole = () => setAddRoleConfirmation(true);

    const addRoleFunction = async() => {
        try {
            let response = await axios.post(addUsersApi.addRole(), {
                title: roleName,
                fullAccess: isTotalAccess,
            }, {
                headers: { Authorization: token }
            });
            
            if(response.status === 200) {
                setAddRoleConfirmation(false);
                setRun(prev => prev + 1);
                setShowDoneMessage(true); 
                setTimeout(() => setShowDoneMessage(false), 2000); 
            } else {
                console.error(`Failed to add role:`, response.status);
            }
        } catch(error) {
            console.error("Error adding role:", error.message);
        }
    };

    const cancelAddRole = () => setAddRoleConfirmation(false);

    const handleTypeChange = (event) => {
        setType(event.target.value);
        const selectedName = event.target.options[event.target.selectedIndex].dataset.type;
        setSelectedTypeName(selectedName);
    };

    const handleSetIsAccess = () => setIsTotalAccess(!isTotalAccess);

    async function Submit(e) {
        e.preventDefault();
        try {
            let res = await axios.post(addUsersApi.addNewUser(), {
                firstName: fName,
                lastName: lName,
                email: email,
                type: parseInt(type),
                password: password,
                phoneNumber: phoneNum,
                roleIdstoAdd: selectedRoles,
            }, { headers: { Authorization: token } });

            navigation('/ecommerce');
        } catch(err) {
            setEmailError(err.response?.data?.errorMessage || "An error occurred");
        }
    }

    return (
        <>
            <div className="add-user-background flex">
                
                <button className="add-role-btn" onClick={handleAddRole}>
                    <MdOutlineAddTask className="add-role-icon" />
                    <span>Add Role</span>
                </button>

                <div className="add-user-form-container">
                    <form onSubmit={Submit} className="add-user-form">
                        <div className="form-header flex">
                            <FaRegUserCircle className="user-icon"/>
                            <h2>Add New User</h2>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name:</label> 
                                <input 
                                    type="text" 
                                    placeholder="First name" 
                                    value={fName} 
                                    onChange={(e) => setFName(e.target.value)} 
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Last Name:</label> 
                                <input 
                                    type="text" 
                                    placeholder="Last name" 
                                    value={lName} 
                                    onChange={(e) => setLName(e.target.value)} 
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input 
                                    id="email" 
                                    placeholder="Email address" 
                                    type="email" 
                                    required 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {emailError && <span className="error-message">{emailError}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number:</label>
                                <input 
                                    id="phone" 
                                    placeholder="Phone number" 
                                    type="tel" 
                                    value={phoneNum} 
                                    onChange={(e) => setPhoneNum(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password:</label>
                                <input 
                                    id="password" 
                                    placeholder="Password (min 8 chars)" 
                                    type="password" 
                                    minLength="8"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="repeat">Confirm Password:</label>
                                <input 
                                    id="repeat" 
                                    placeholder="Confirm password" 
                                    type="password" 
                                    value={passwordR} 
                                    onChange={(e) => setPasswordR(e.target.value)} 
                                    required
                                />
                                {passwordR && passwordR !== password && (
                                    <span className="error-message">Passwords don't match</span>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="user-type">User Type:</label>
                                <select 
                                    id="user-type"
                                    value={type}  
                                    onChange={handleTypeChange}
                                    required
                                >
                                    <option value="">Select user type</option>
                                    {UserType.map((option) => (
                                        <option 
                                            key={option.value} 
                                            value={option.value} 
                                            data-type={option.label}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Roles:</label>
                                <Select 
                                    multi 
                                    options={roleIds} 
                                    labelField="title" 
                                    valueField="id"  
                                    color="#528e25" 
                                    value={selectedRoles} 
                                    onChange={(e) => setSelectedRoles(e.map(option => option.id))}
                                    placeholder="Select roles"
                                    className="roles-select"
                                /> 
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn">
                                Register User
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Add Role Modal */}
            {addRoleConfirmation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add New Role</h3>
                        
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Role Name:</label>
                                <input 
                                    type="text" 
                                    value={roleName} 
                                    onChange={(e) => setRoleName(e.target.value)}  
                                    placeholder="Enter role name"
                                    required
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>Full Access</label>
                                <input 
                                    type="checkbox" 
                                    checked={isTotalAccess} 
                                    onChange={handleSetIsAccess}
                                />
                                    
                                
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="cancel-btn" 
                                    onClick={cancelAddRole}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="confirm-btn" 
                                    onClick={addRoleFunction}
                                    disabled={!roleName}
                                >
                                    Add Role
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Success Message */}
            {showDonemessage && (
                <div className="success-message">
                    Role added successfully!
                </div>
            )}
        </>
    );
}