import './styles/Modal.css';

function AboutModal({ onClose }) {
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
                            <p> Welcome to my text-rewriting platform! This service is motivated by a desire to make text more human-like. </p>

                            <p> While making this I was committed to maintaining readability and clarity so the algorithms prioritize preserving the original intent of your text while making it undetectable by AI systems. </p>

                            <p> I believe in the power of technology to enhance and enrich human communication, and this platform is designed with this goal in mind. </p>

                            <p> Thank you for choosing my service, and I look forward to helping you create text that truly sounds human-generated! </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutModal;
