import React, { useState } from 'react';
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
import LoginOptions from './components/LoginOptions';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import ApiKeyModal from './components/ApiKeyModal';
// import { useAuthState } from 'react-firebase-hooks/auth';
import { getUserApiKey, signOut } from './components/api/firebase';

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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [email, setEmail] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [chatGPTApiKey, setChatApiKey] = useState(process.env.REACT_APP_OPENAI_API_KEY);
  const [GPTZeroApiKey, setGPTZeroApiKey] = useState(process.env.REACT_APP_GPT_ZERO_API_KEY);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const { humanize } = Api({ text, setText, setLoading, setError, setOutput, setAskOutput, setZeroScore, setOriginalScore, setOriginalText, chatGPTApiKey, GPTZeroApiKey });
  const { askHuman } = Api({ text, setText, setLoading, setError, setOutput, setAskOutput, setZeroScore, setOriginalScore, setOriginalText, chatGPTApiKey, GPTZeroApiKey });


  const handleButtonClick = () => {
    humanize();
  };

  const handleAskButtonClick = () => {
    askHuman();
  };

  const toggleLoginModal = () => {
    setShowLoginModal(!showLoginModal);
    setShowSignUpModal(false);
  };

  const toggleSignUpModal = () => {
    setShowSignUpModal(!showSignUpModal);
    setShowLoginModal(false);
  };

  const toggleApiKeyModal = () => {
    setShowApiKeyModal(!showApiKeyModal);
  };

  const toggleLoggedIn = async (email) => {
    setLoggedIn(!loggedIn);
    setEmail(email);
    setShowLoginModal(false);
    setShowSignUpModal(false);

    // get user api key
    const apiKey = await getUserApiKey(email);
    if (apiKey !== null) {
      setApiKeySet(true);
      setChatApiKey(apiKey);
    }
  };

  const signOutUser = () => {
    signOut();
    setLoggedIn(false);
    setApiKeySet(false);
    setChatApiKey(process.env.REACT_APP_OPENAI_API_KEY);
    setGPTZeroApiKey(process.env.REACT_APP_GPT_ZERO_API_KEY);
    setEmail('');
  };

  const changeToGuestMode = () => {
    setLoggedIn(true);
    setApiKeySet(true);
    setGuestMode(true);
    setChatApiKey(process.env.REACT_APP_OPENAI_API_KEY);
    setGPTZeroApiKey(process.env.REACT_APP_GPT_ZERO_API_KEY);
  };

  // scroll to output if output is present
  if (output || askOutput) {
    window.scrollTo(0, document.body.scrollHeight);
  }

  return (
    <>
      { (showContactModal || showAboutModal || showLoginModal || showSignUpModal || showApiKeyModal || loading || error) && <div className="modal-open"></div> }
      <div className="App-background"></div>
      <div className={`App ${loading ? 'App-loading' : ''}`}>
        <header className={`App-header ${loading ? 'App-header-loading' : ''}`}>
          <Title />
        </header>

        {loading && <TypeWriter />}

        {
          !loggedIn ? (
            <>
              {!showLoginModal && !showSignUpModal && <LoginOptions onGuest={changeToGuestMode} onLogin={toggleLoginModal} onSignUp={toggleSignUpModal} />}
              <LoginModal onClose={toggleLoginModal} show={showLoginModal} toggleLoggedIn={toggleLoggedIn} />
              <SignUpModal onClose={toggleSignUpModal} show={showSignUpModal} toggleLoggedIn={toggleLoggedIn} />
            </>
          ) : (
            
              !apiKeySet ? (
                <ApiKeyModal onClose={() => setApiKeySet(true)} email={email} show={!apiKeySet} changeToGuestMode={changeToGuestMode} setChatApiKey={setChatApiKey} setGPTZeroApiKey={setGPTZeroApiKey} />
              ) : (
                <main className={`App-main ${loading ? 'App-main-loading' : ''}`}>

                  <Input 
                    text={text} 
                    setText={setText} 
                    handleButtonClick={handleButtonClick}
                    handleAskButtonClick={handleAskButtonClick}
                    loading={loading}
                  />

                  {error && <ErrorMessage onClose={() => setError(false)} />}
                  {!error && !output && !askOutput && <NoticeMessage />}
                  {!error && output && !loading && <Ouput output={output} score={zeroScore} originalScore={originalScore} originalText={originalText} />}
                  {!error && askOutput && !loading && <AskOutput output={askOutput} score={zeroScore} />}
                </main>
              )
            
          )
        }

        {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
        {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}
        <ApiKeyModal onClose={() => setShowApiKeyModal(false)} show={showApiKeyModal} email={email} changeToGuestMode={changeToGuestMode} setChatApiKey={setChatApiKey} setGPTZeroApiKey={setGPTZeroApiKey} />
        <SignUpModal onClose={toggleSignUpModal} show={showSignUpModal} toggleLoggedIn={toggleLoggedIn} />

        <footer className={`App-footer ${output || askOutput ? 'App-footer-bottom' : ''}`}>
          <Footer onContactButtonClick={() => setShowContactModal(true)} onAboutButtonClick={() => setShowAboutModal(true)} loggedIn={loggedIn} signOut={signOutUser} signUp={toggleSignUpModal} toggleApiKeyModal={toggleApiKeyModal} guestMode={guestMode} />
        </footer>
      </div>
    </>
  );
}

export default App;
