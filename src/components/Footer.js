import './styles/Footer.css';

function Footer({ onContactButtonClick, onAboutButtonClick, loggedIn, signOut, signUp, toggleApiKeyModal }) {
    return (
        <div className="Footer">
            <p>2022-2023 © GPTOne</p>
            <p> | </p>
            <a onClick={onContactButtonClick}>Contact</a>
            <p> | </p>
            <a onClick={onAboutButtonClick}>About</a>
            {loggedIn && !guestMode && 
            <>
                <p> | </p>
                <a onClick={loggedIn ? signOut : signUp}>{loggedIn ? 'Sign Out' : 'Sign Up'}</a>
                <p> | </p>
                <a onClick={toggleApiKeyModal}>API Key</a>
            </>}

        </div>
    );
}

export default Footer;
