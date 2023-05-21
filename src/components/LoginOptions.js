import React from 'react';
import './styles/LoginOptions.css';

function LoginOptions({ onLogin, onSignUp, onGuest }) {
  return (
    <div className="LoginOptions">
        <div className="LoginOptions-top">
            <button className="LoginOptions-button" onClick={onLogin}>Login</button>
            <button className="LoginOptions-button" onClick={onSignUp}>Sign Up</button>
        </div>
        {/* <button className="LoginOptions-guest-button" onClick={onGuest}>Continue as Guest (Limited)</button> */}
    </div>
  );
}

export default LoginOptions;