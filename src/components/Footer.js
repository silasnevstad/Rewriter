import React from 'react';
import './styles/Footer.css';

function Footer({ onContactButtonClick, onAboutButtonClick, loggedIn, signOut, signUp, toggleApiKeyModal, guestMode }) {
    return (
        <div className="Footer">
            <p>2022-2023 © GPTOne</p>
            <p> | </p>
            <button className="footer-link" onClick={onContactButtonClick}>Contact</button>
            <p> | </p>
            <button className="footer-link" onClick={onAboutButtonClick}>About</button>
            {loggedIn && !guestMode && 
            <>
                <p> | </p>
                <button className="footer-link" onClick={loggedIn ? signOut : signUp}>{loggedIn ? 'Sign Out' : 'Sign Up'}</button>
                <p> | </p>
                <button className="footer-link" onClick={toggleApiKeyModal}>API Key</button>
            </>}

        </div>
    );
}

export default Footer;
