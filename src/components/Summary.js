import './styles/Summary.css';

function Summary({ text, originalText, showOriginal }) {
    return (
        <div className="Summary">
            <div className="summary-text">
                {showOriginal ? (
                    originalText.split('\n').map((item, key) => {
                        return (
                            <span key={key}>
                                {item}
                                <br />
                            </span>
                        )
                    })
                ) : (
                    text.split('\n').map((item, key) => {
                        return (
                            <span key={key}>
                                {item}
                                <br />
                            </span>
                        )
                    })  
                )}
            </div>
        </div>
    );
}

export default Summary;
