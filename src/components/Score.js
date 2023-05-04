import React from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import './styles/Score.css'

function Score({ score, originalScore, showOriginal, setShowOriginal }) {
    const getOverallProb = (score) => {
        const prob = score.completely_generated_prob * 100;
        if (prob > 100) {
            return 100;
        }
        if (prob < 1) {
            return 0;
        }
        return Math.round(prob);
    };

    const getOverallBurstiness = (score) => {
        // round to 4 decimal places
        return Math.round(score.overall_burstiness * 100) / 100;
    };

    const getOverallPerplexity = (score) => {
        let sum = 0;

        for (let i = 0; i < score.sentences.length; i++) {
            sum += score.sentences[i].perplexity;
        }

        return Math.round(sum / score.sentences.length * 100) / 100;
    };

    const handleButtonClick = () => {
        setShowOriginal(!showOriginal);
    };


    return (
        <div className="Score">
            <div className="Score-header">
                <div className="score-section">
                    <h3> <span className='score-bold-text'>{showOriginal ? getOverallProb(originalScore) : getOverallProb(score)}%</span> AI generated. </h3>
                    <div className="average-entry"> 
                        <div className="average-pie-chart">
                            <PieChart
                                data={[
                                    {
                                    value: originalScore ? showOriginal ? getOverallPerplexity(originalScore) : getOverallPerplexity(score) : getOverallPerplexity(score),
                                    color: '#5C86FF',
                                    },
                                ]}
                                lineWidth={50}
                                startAngle={270}
                                animate={2000}
                                background="#444"
                                totalValue={250}
                                style={{
                                    height: 'auto',
                                    width: '90%',
                                }}
                            />
                        </div>
                        <h1>
                            Perplexity: 
                            <span className="average-score"> {showOriginal ? getOverallPerplexity(originalScore) : getOverallPerplexity(score)} </span>
                        </h1>
                    </div>
                    <div className="average-entry"> 
                        <div className="average-pie-chart">
                            <PieChart
                                data={[
                                    {
                                    value: originalScore ? showOriginal ? getOverallBurstiness(originalScore) : getOverallBurstiness(score) : getOverallBurstiness(score),
                                    color: '#5C86FF',
                                    },
                                ]}
                                lineWidth={50}
                                startAngle={270}
                                animate={2000}
                                background="#444"
                                totalValue={300}
                                style={{
                                    height: 'auto',
                                    width: '90%',
                                }}
                            />
                        </div>
                        <h1>
                        Burstiness: 
                            <span className="average-score"> {showOriginal ? getOverallBurstiness(originalScore) : getOverallBurstiness(score)} </span>
                        </h1>
                    </div>
                </div>
            </div>
            {originalScore && (
                <div className="score-button-section">
                    <button className="score-button" onClick={handleButtonClick}> {showOriginal ? 'Back' : 'Original'} </button>
                </div>
            )}
        </div>
    );
}

export default Score;
