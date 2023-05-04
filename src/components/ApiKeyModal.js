import React, { useState, useEffect, useRef } from 'react';
import './styles/Modal.css'
import './styles/LoginModal.css';
import { addUserApiKey } from './api/firebase';

function ApiKeyModal({ onClose, email, show, changeToGuestMode, setChatApiKey, setGPTZeroApiKey }) {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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

    if (!show) {
        return null;
    }

    const handleSetAPI = async () => {
        setLoading(true);
        setError('');
        try {
            addUserApiKey(email, apiKey);
            setChatApiKey(apiKey);
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
                <div className="header">
                    <div className="content">
                        <span className="title"><span className='title-span'>Set</span> API <span className='title-span'>Key</span></span>
                        {error ? (
                            <div className="login-error">{error}</div>
                        ) : null}

                        <div className="bottom-content">
                            <form>
                                <div className="form-group">
                                    <input type="password" id="key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="" />
                                </div>
                                <button type="submit" className="submit" disabled={!apiKey || loading} onClick={handleSetAPI}>
                                    {loading ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        'Set API Key'
                                    )}
                                </button>
                                <div className="lower-options">
                                    <a type="submit" className="lower-anchors" href="https://platform.openai.com/account/api-keys" target="_blank">
                                        Get one here
                                    </a>
                                    <button type="submit" className="lower-buttons" onClick={changeToGuestMode}>
                                        Use Shared API
                                    </button>
                                </div>
                            </form>
                        </div>
                        <p className="api-modal-info" style={{ color: '#aaa', marginTop: '2em', fontSize: '1em' }}> Make sure you have GPT-4 otherwise might not work. 👎 </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApiKeyModal;