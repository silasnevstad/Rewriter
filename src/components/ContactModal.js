import { useState, useEffect } from 'react';
import './styles/Modal.css';
import emailjs from 'emailjs-com';

function Modal({ onClose }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (success) {
            setTimeout(() => {
                onClose();
            }, 500);
        }
    }, [success, onClose]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Send the form data to EmailJS
        emailjs.send('service_hc9akgh', 'template_2cjai8y', { name, email, message }, '5zJalJbOIpV3-eipy')
            .then((response) => {
                console.log('Email successfully sent!', response);
                setLoading(false);
                setSuccess(true);
            })
            .catch((err) => {
                console.error('Failed to send email:', err);
                setLoading(false);
            });
    };

    return (
        <div className={`Modal ${success ? 'success-animation' : ''}`}>
            <div className="card">
                <button className="dismiss" type="button" onClick={onClose} disabled={loading}>
                    ×
                </button>
                <div className="header">
                    <div className="content">
                        <span className="title">Contact <span style={{ color: '#333' }}>Us</span></span>
                        <div className="bottom-content">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    {/* <label htmlFor="name">Name:</label> */}
                                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                                </div>
                                <div className="form-group">
                                    {/* <label htmlFor="email">Email:</label> */}
                                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                                </div>
                                <div className="form-group">
                                    {/* <label htmlFor="message">Message:</label> */}
                                    <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" />
                                </div>
                                <button type="submit" className="submit" disabled={!name || !email || !message || loading}>
                                    {loading ? (
                                        <div className="spinner"></div>
                                    ) : success ? (
                                        'Sent!'
                                    ) : (
                                        'Send'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;
