import { useState } from 'react';
import Score from './Score';
import OutputSentences from './OutputSentences';
import Summary from './Summary';
import './styles/Output.css'

function Output({ output, score, originalScore, originalText }) {
    const [showOriginal, setShowOriginal] = useState(false);

    const getOverallProb = (score) => {
        return Math.round(score.completely_generated_prob * 100);
    };

    return (
        <div className="Output-container">
            <div className="Output-notice">
                {getOverallProb(score) < 10 ? (
                    <p className="Output-notice-text">
                        This is detected as '<span className="Output-notice-text-bold">human</span>' generated
                    </p>
                ) : (
                    <p className="Output-notice-text">
                        This is detected as '<span className="Output-notice-text-bold">AI</span>' generated
                    </p>
                )}
            </div>

            <div className="Output-scroll">
                <p> 👇 </p>
            </div>

            <div className="Output">
                <Summary text={output} originalText={originalText} showOriginal={showOriginal} />
                <div className="Output-row">
                    <div className="Output-row-left">
                        <Score score={score} originalScore={originalScore} showOriginal={showOriginal} setShowOriginal={setShowOriginal} />
                    </div>
                    <div className="Output-row-right">
                        <OutputSentences score = {score} originalScore={originalScore} showOriginal={showOriginal} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Output;