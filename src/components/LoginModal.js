import React, { useState, useEffect, useRef } from 'react';
import './styles/Modal.css'
import './styles/LoginModal.css';
import { signIn } from './api/firebase';

function LoginModal({ onClose, show, toggleLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && modalRef.current === e.target) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [modalRef]);

    const errorCodes = {
        'auth/invalid-email': 'Invalid email address format.',
        'auth/user-not-found': 'User not found.',
        'auth/wrong-password': 'Incorrect password.',
    }

    if (!show) {
        return null;
    }

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await signIn(email, password);
            if (!response.success) {
                setError(errorCodes[response.error]);
                return;
            }
            toggleLoggedIn(email);
            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Modal" ref={modalRef}>
            <div className="card">
                <button className="dismiss" type="button" onClick={onClose} disabled={loading}>
                    ×
                </button>

                <div className="header">
                    <div className="content">
                        <span className="title"><span className='title-span'>Log</span>in</span>
                        {error ? (
                            <div className="login-error">{error}</div>
                        ) : null}

                        <div className="bottom-content">
                            <form>
                                <div className="form-group">
                                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                                </div>
                                <div className="form-group">
                                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                                </div>
                                <button type="submit" className="submit" disabled={!email || !password || loading} onClick={handleLogin}>
                                    {loading ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        'Login'
                                    )}
                                </button>
                                {/* <button type="submit" className="submit">
                                    {loading ? (
                                        <div className="spinner"></div>
                                    ) : success ? (
                                        'Sent!'
                                    ) : (
                                        'Send'
                                    )}
                                </button> */}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {/* Add your login modal HTML and form elements here */}
            {/* Bind input fields with setEmail and setPassword */}
            {/* Bind login and signup buttons with handleLogin and handleSignup */}
            {/* Display the error message if it exists */}
        </div>
    );
}

export default LoginModal;