import React, { useState, useRef, useEffect } from 'react';
import './styles/Input.css';

function Input({ text, setText, handleButtonClick, handleAskButtonClick, loading }) {
    const [placeholder, setPlaceholder] = useState('Type text you want to rewrite here');
    const placeholders = [
        'Type text you want to rewrite here',
        'Write a 300 words about Napoleon',
        'Write an email to my boss',
        'Generate a poem written in Emily Dickinson\'s style',
        'Write about the future of AI',
        'Generate a story about a Bee in Stephen King\'s style',
    ]

    const handleClick = () => {
        handleButtonClick();
    };

    const getWordCount = (text) => {
        // Split on white space and filter out empty strings
        const words = text.split(/\s+/).filter(word => word.length > 0);
        return words.length;
    };

    const getWordCountString = (text) => {
        const wordCount = getWordCount(text);
        return wordCount === 1 ? 'word' : 'words';
    };
    
    return (
        <div className="Input">
            <div className={`input-wrapper ${loading ? 'loadinginputwrapper' : ''}`}>
                <textarea
                    className={`input ${loading ? 'loadinginput' : ''}`}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={placeholder}
                />
                <div className="input-word-count">
                    <p> {getWordCount(text)} {getWordCountString(text)} </p>
                </div>
            </div>
            <button onClick={handleAskButtonClick} disabled={loading} className="Input-button-blue">
                Ask
            </button>
            <button onClick={handleClick} disabled={loading} className="Input-button-blue">
                Rewrite
            </button>

        </div>
    );
}

export default Input;
