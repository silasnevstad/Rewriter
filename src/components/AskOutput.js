import './styles/Output.css';
import { useState } from 'react';
import Score from './Score';
import Summary from './Summary';
import OutputSentences from './OutputSentences';

function AskOutput ({ output, score, originalScore, originalText }) {
    const [showOriginal, setShowOriginal] = useState(false);

    const getOverallProb = (score) => {
        return Math.round(score.completely_generated_prob * 100);
    };

    return (
        <div className="Output-container">
            <div className="Output-notice">
                {getOverallProb(score) < 10 ? (
                    <p className="Output-notice-text">
                       👍 This is detected as <span className="Output-notice-text-bold">human</span>-generated text.
                    </p>
                ) : (
                    <p className="Output-notice-text">
                        This is detected as <span className="Output-notice-text-bold">AI</span>-generated generated.
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
                    <OutputSentences score = {score} originalScore={originalScore} showOriginal={showOriginal} />
                </div>
            </div>
        </div>
    );
}

export default AskOutput;