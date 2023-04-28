import './styles/Modal.css';

function Modal({ onClose }) {
    return (
        <div className="Modal">
            <div className="card">
                <button className="dismiss" type="button" onClick={onClose}>
                    ×
                </button>
                <div className="header">
                    <div className="content">
                        <span className="title">About <span className="title-span">Us</span></span>

                        <div className="bottom-content">
                            <p> Welcome to our text-rewriting platform! This service is motivated by a desire to make text more human-like. </p>

                            <p> We are committed to maintaining readability and clarity in your text and our algorithms prioritize preserving the original intent of your text while making it undetectable by AI systems. </p>

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
