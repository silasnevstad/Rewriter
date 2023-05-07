import './styles/Modal.css';
import './styles/AccountModal.css';

function AccountModal({ onClose, email, apiKey, signOut, toggleApiKeyModal }) {
    return (
        <div className="Modal">
            <div className="card">
                <button className="dismiss" type="button" onClick={onClose}>
                    ×
                </button>
                <div className="header">
                    <div className="content">
                        <span className="title">Account </span>

                        <div className="bottom-content">
                            <div className="account-info">
                                <p className="account-info-title">Email</p>
                                <p className="account-info-content" style={{ marginTop: '-10px' }} type="">{email}</p>
                            </div>
                            <div className="account-info">
                                <p className="account-info-title">API Key</p>
                                {apiKey !== process.env.REACT_APP_CHAT_GPT_API_KEY ?
                                    <p className="account-info-content" style={{ marginTop: '-10px' }} type="">...{apiKey.slice(-5)}</p> : 
                                    <p className="account-info-content" style={{ marginTop: '-10px' }} type="">Nothing here yet</p>
                                }
                            </div>

                            <div className="account-buttons">
                                <button className="account-button" type="button" onClick={signOut}>
                                    Sign Out
                                </button>
                                <button className="account-button" type="button" onClick={toggleApiKeyModal}>
                                    {apiKey === process.env.REACT_APP_CHAT_GPT_API_KEY ? 'Set Api Key' : 'Change Api Key'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountModal;
