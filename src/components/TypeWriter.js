import './styles/TypeWriter.css';

function TypeWriter() {
    return (
        <div className="typewriter-container">
            <div class="typewriter">
                <div class="slide"><i></i></div>
                <div class="paper"></div>
                <div class="keyboard"></div>
            </div>
            {/* <div class="loader">
                <p>loading</p>
                <div class="words">
                    <span class="word">Clarifying</span>
                    <span class="word">Adjusting fluency</span>
                    <span class="word">Rewriting originality</span>
                    <span class="word">Adjusting naturalness</span>
                    <span class="word">Humanizing</span>
                </div>
            </div> */}
        </div>
    );
}

export default TypeWriter;