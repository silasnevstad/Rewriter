import React, { useState, useRef, useEffect } from 'react';
import './styles/Input.css';

function Input({ text, setText, handleButtonClick, loading }) {

    const handleClick = () => {
        handleButtonClick();
    };

    return (
        <div className="Input">
            <div className={`input-wrapper ${loading ? 'loadinginputwrapper' : ''}`}>
                <textarea
                    className={`input ${loading ? 'loadinginput' : ''}`}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Enter text here"
                />

            </div>
            {/* <button onClick={handleButtonClick('summary')} disabled={loading} className="Input-button-blue">
                Summarize
            </button> */}
            <button onClick={handleClick} disabled={loading} className="Input-button-blue">
                Rewrite
            </button>
        </div>
    );
}

export default Input;
