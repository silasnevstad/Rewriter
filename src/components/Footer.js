import './styles/Footer.css';

function Footer({ onContactButtonClick, onAboutButtonClick }) {
    return (
        <div className="Footer">
            <p>2022-2023 © GPTOne</p>
            <p> | </p>
            <a onClick={onContactButtonClick}>Contact</a>
            <p> | </p>
            <a onClick={onAboutButtonClick}>About</a>
        </div>
    );
}

export default Footer;
