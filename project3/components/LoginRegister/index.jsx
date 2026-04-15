import React, { useState, useEffect } from 'react';

import './styles.css';

function LoginRegister() {
    const [isLogin, setIsLogin] = useState(true);   //true if login, false if register
    const [login_name, setLogin_name] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        //...
    }
    
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