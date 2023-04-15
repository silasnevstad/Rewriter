import React, { useState, useCallback } from 'react';
import './App.css';
import Title from './components/Title';
import Input from './components/Input';
import TypeWriter from './components/TypeWriter';
import ContactModal from './components/ContactModal'; 
import AboutModal from './components/AboutModal';
import Ouput from './components/Output';
import AskOutput from './components/AskOutput';
import ErrorMessage from './components/ErrorMessage';
import NoticeMessage from './components/NoticeMessage';
import Footer from './components/Footer';
import Api from './components/api/Api';

function App() {
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [askOutput, setAskOutput] = useState('');
  const [zeroScore, setZeroScore] = useState('');
  const [originalScore, setOriginalScore] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const { processAPI } = Api({ text, setLoading, setError, setOutput, setZeroScore, setOriginalScore, setOriginalText });
  const { askAPI } = Api({ text, setLoading, setError, setOutput, setAskOutput, setZeroScore, setOriginalScore, setOriginalText });

  const handleButtonClick = () => {
    processAPI();
  };

  const handleAskButtonClick = () => {
    askAPI();
  };

  // scroll to output if output is present
  if (output || askOutput) {
    window.scrollTo(0, document.body.scrollHeight);
  }

  return (
    <>
      { (showContactModal || showAboutModal || loading || error) && <div className="modal-open"></div> }
      <div className={`App ${loading ? 'App-loading' : ''}`}>
        <header className={`App-header ${loading ? 'App-header-loading' : ''}`}>
          <Title />
        </header>

        {loading && <TypeWriter />}

        <main className={`App-main ${loading ? 'App-main-loading' : ''}`}>

          <Input 
            text={text} 
            setText={setText} 
            handleButtonClick={handleButtonClick}
            handleAskButtonClick={handleAskButtonClick}
            loading={loading}
          />

          {error && <ErrorMessage onClose={() => setError(false)} />}
          {/* {!error && !output && !askOutput && <NoticeMessage />} */}
          {/* {!error && output && <Summary text={output} />} */}
          {!error && output && zeroScore && <Ouput output={output} score={zeroScore} originalScore={originalScore} originalText={originalText} />}
          {!error && askOutput && <AskOutput output={askOutput} score={zeroScore} originalScore={originalScore} originalText={originalText} />}
        </main>

        {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
        {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}

        <footer className={`App-footer ${loading ? 'App-footer-loading' : ''}`}>
          <Footer onContactButtonClick={() => setShowContactModal(true)} onAboutButtonClick={() => setShowAboutModal(true)} />
        </footer>
      </div>
    </>
  );
}

export default App;
