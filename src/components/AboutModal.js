import { useState } from 'react';
import './styles/Modal.css';

function Modal({ onClose }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Send the form data to the server or some other destination
        onClose();
    };

    return (
        <div className="Modal">
            <div className="card">
                <button className="dismiss" type="button" onClick={onClose}>
                    ×
                </button>
                <div className="header">
                    <div className="content">
                        <span className="title">About <span style={{ color: '#333' }}>Us</span></span>

                        <div className="bottom-content">
                            <p> Welcome to our text-rewriting platform! This service is motivated by a desire to make text more human-like and avoid detection by AI systems. Our mission is to provide a solution that enables you to communicate privately or share content without worrying about being caught by schools, professors, or other automated systems. </p>

                            <p> What sets us apart is our commitment to maintaining readability and clarity in your rewritten text. Unlike other services that might rely on obscure words or convoluted sentence structures, our algorithms prioritize preserving the original intent of your text while making it undetectable by AI systems. </p>

                            <p> We believe in the power of technology to enhance and enrich human communication, and our platform is designed with this goal in mind. </p>

                            <p> Thank you for choosing our service, and we look forward to helping you create text that truly sounds human-generated! </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;
