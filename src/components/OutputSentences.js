import './styles/OutputSentences.css';

function OutputSentences({ score, originalScore, showOriginal }) {
    const getHighestPerplexity = (score) => {
        let max = 0;

        for (let i = 0; i < score.sentences.length; i++) {
            if (score.sentences[i].perplexity > max) {
                max = score.sentences[i].perplexity;
            }
        }

        return Math.round(max * 10000) / 10000;
    };

    const getLowestPerplexity = (score) => {
        let min = 100
        
        for (let i = 0; i < score.sentences.length; i++) {
            if (score.sentences[i].perplexity < min) {
                min = score.sentences[i].perplexity;
            }
        }

        return Math.round(min * 10000) / 10000;
    };

    const getHighestPerplexistySentence = (score) => {
        let max = getHighestPerplexity(score);

        for (let i = 0; i < score.sentences.length; i++) {
            if (score.sentences[i].perplexity === max) {
                return removePerplexity(score.sentences[i].sentence);
            }
        }
    };

    const getLowestPerplexitySentence = (score) => {
        let min = getLowestPerplexity(score);

        for (let i = 0; i < score.sentences.length; i++) {
            if (score.sentences[i].perplexity === min) {
                return removePerplexity(score.sentences[i].sentence);
            }
        }
    };

    // removes [Perplexity: 0.0000] from the end of the sentence if it exists
    const removePerplexity = (sentence) => {
        if (sentence.includes('[Perplexity:')) {
            let newSentence = sentence.substring(0, sentence.indexOf('[Perplexity:'));
            // remove space at end and add period
            return newSentence.substring(0, newSentence.length - 1) + '.';
        } else {
            return sentence;
        }
    };


    // returns the sentence with the lowest perplexity and the highest perplexity
    
    return (
        <div className="OutputSentences">
            {/* {showOriginal ?? ( */}
                <>
                    <h3> 
                        The sentence with the most perplexity is, "
                        <span className='OutputSentences-bold-text'>{showOriginal ? getHighestPerplexistySentence(originalScore) : getHighestPerplexistySentence(score)}</span>
                        ", with a perplexity of <span className='OutputSentences-bold-score'>{showOriginal ? getHighestPerplexity(originalScore) : getHighestPerplexity(score)}</span>.
                    </h3>
                    <h3>
                        The sentence with the least perplexity is, "
                        <span className='OutputSentences-bold-text'>{showOriginal ? getLowestPerplexitySentence(originalScore) : getLowestPerplexitySentence(score)}</span>
                        ", with a perplexity of <span className='OutputSentences-bold-score'>{showOriginal ? getLowestPerplexity(originalScore) : getLowestPerplexity(score)}</span>.
                    </h3>
                </>
            {/* )} */}
            
        </div>
    );
}

export default OutputSentences;

