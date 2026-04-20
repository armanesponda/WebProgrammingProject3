import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './styles.css';

function LoginRegister({setCurrentUser}) {
    const [isLogin, setIsLogin] = useState(true);   //true if login, false if register
    const navigate = useNavigate();
    const [login_name, setLogin_name] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (login_name === '' || password === '') {
            setError("Please enter login name and password.");
            return;
        }

        // fake successful login user
        const fakeUser = {
            _id: "12345",
            first_name: "Test",
            last_name: "User",
            login_name
        };

        setCurrentUser(fakeUser);
        navigate(`/`);  //navigate to home after login
    };
    
    const handleRegister = (e) => {
        e.preventDefault();
        //...
    }

    return (
        <div>
            <h2>{isLogin ? "Log in" : "Register"}</h2>

            {error && <p className="errorMsg">{error}</p>}

            {isLogin ? (
                //login
                <form onSubmit={handleLogin}>
                    <input
                        value={login_name}
                        onChange={(e) => setLogin_name(e.target.value)}
                        placeholder='Login Name'
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password'
                    />
                    <button type="submit">Login</button>
                </form>
            ) : (
                //register
                <form onSubmit={handleRegister}>
                    <input
                        value={login_name}
                        onChange={(e) => setLogin_name(e.target.value)}
                        placeholder="Login Name"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                    <button type="submit">Register</button>
                </form>
            )}
            <p
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                }}
                style={{ cursor: "pointer", marginTop: "10px" }}
            >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </p>
        </div>
    )
}

export default LoginRegister;