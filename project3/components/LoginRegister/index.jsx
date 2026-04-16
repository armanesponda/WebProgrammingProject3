import React, { useState, useEffect } from 'react';

import './styles.css';

function LoginRegister({setCurrentUser}) {
    const [isLogin, setIsLogin] = useState(true);   //true if login, false if register
    const [login_name, setLogin_name] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/path", {      //edit
                //POST... utilize useMutation
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Login failed.")
            }
            const user = await res.json();

            //set user after successful login
            setCurrentUser(user);
        } catch (err) {
            setError(err.message);
        }
    };
    
    const handleRegister = (e) => {
        e.preventDefault();
        //...
    }

    return (
        <div>
            <h2>{isLogin ? "Log in" : "Register"}</h2>
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
                    <input></input>
                </form>
            )}
        </div>
    )
}

export default LoginRegister;