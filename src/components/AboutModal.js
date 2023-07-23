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
                    </div>
                </div>
                <div className="bottom-content">
                    <p> Welcome to this text-rewriting platform! This service is motivated by a desire to make text more human-like. </p>
                    <p> While making this, the focus was on maintaining readability and clarity so the algorithms prioritize preserving the original intent of your text while making it undetectable by AI systems. </p>
                </div>
            </div>
        </div>
    );
}

export default AboutModal;
