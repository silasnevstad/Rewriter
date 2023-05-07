import React from 'react';
import './styles/Footer.css';

function Footer({ onContactButtonClick, onAboutButtonClick, loggedIn, signOut, signUp, toggleApiKeyModal, guestMode }) {
    return (
        <div className="Footer">
            {/* {loggedIn && !guestMode && 
            <div className="lower-footer">
                <button className="footer-link" onClick={loggedIn ? signOut : signUp}>{loggedIn ? 'Sign Out' : 'Sign Up'}</button>
                <p className="mobile-hidden"> | </p>
                <button className="footer-link" onClick={toggleApiKeyModal}>API Key</button>
                <p className="mobile-hidden"> | </p>
            </div>} */}
            {/* <div className="lower-footer"> */}
                <p>2022-2023 © GPTOne</p>
                <p className="mobile-hidden"> | </p>
                <button className="footer-link" onClick={onContactButtonClick}>Contact</button>
                <p className="mobile-hidden"> | </p>
                <button className="footer-link" onClick={onAboutButtonClick}>About</button>
            {/* </div> */}
        </div>
    );
}

export default Footer;
