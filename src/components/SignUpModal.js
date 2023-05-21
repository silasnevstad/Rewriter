import React, { useState, useEffect, useRef } from 'react';
import './styles/LoginModal.css';
import './styles/Modal.css'
import { signUp } from './api/firebase';

function SingUpModal({ onClose, show, toggleLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirm] = useState('');
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
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/email-already-in-use': 'Email address already in use.',
    }

    if (!show) {
        return null;
    }

    const handleSignup = async () => {
        setLoading(true);
        try {
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            const response = await signUp(email, password);
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
                        <span className="title"><span className='title-span'>Sign</span> Up</span>
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
                                <div className="form-group">
                                    <input type="password" id="password" value={confirmPassword} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm Password" />
                                </div>
                                <button type="submit" className="submit" disabled={!email || !password || loading} onClick={handleSignup}>
                                    {loading ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        'Sign Up'
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

export default SingUpModal;