import './styles/Modal.css';

function ErrorMessage({ onClose }) {
    const handleClose = () => {
        onClose && onClose();
    };

    return (
        <div className="Modal">
            <div className="card">
                <button className="dismiss" type="button" onClick={handleClose}>
                    ×
                </button>
                <div className="header">
                    <div className="content">
                        <span className="title">Oops! <span className='title-span'>Error</span></span>

                        <div className="bottom-content" style={{ textAlign: 'center' }}>
                            <p>Our system is currently experiencing high demand. We apologize for the inconvenience. Please try again in a few minutes. Thank you for your patience and understanding. 😊</p>
                            <p>Double check your API key is correct if you have added one.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ErrorMessage;
