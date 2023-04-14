import { useState } from 'react';
import axios from 'axios';
const { Configuration, OpenAIApi } = require("openai");

function Api({ text, setLoading, setError, setOutput, zeroScore, setZeroScore, setOriginalScore, setOriginalText }) {
    const API_KEY = "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";
    const configuration = new Configuration({ apiKey: API_KEY });
    const openai = new OpenAIApi(configuration);
    const [original, setOriginal] = useState(true); // true = has not been rewritten, false = has been rewritten
    const [loadingGPTZero, setLoadingGPTZero] = useState(true);
    const [messages , setMessages] = useState([
        {'role': 'user', 'content': 'I need you to rewrite some text. There are two factors that are important when detecting content as AI or human generated, perplexity and burstiness. Perplexity measures the randomness of the text, words and sentence lengths, and burstiness measures the variation in perplexity. As some examples, I will give you two peices of text one is detected as human generated and one if detected as AI generated, anaylze these to better help you rewrite the text to be human-generated. \n'},
        {'role': 'user', 'content': 'This text gets detected as human-generated content: Bitcoin emerged in 2009 as a decentralized digital currency created by the enigmatic Satoshi Nakamoto. It operates on a peer-to-peer network, removing the need for banks and financial institutions. Using blockchain technology, Bitcoin transactions are secure and transparent. This novel approach to transferring value has gained significant attention and adoption. \n\n However, Bitcoin has faced challenges and controversies. Critics argue its decentralized nature can enable illicit activities and its mining process raises environmental concerns. Nonetheless, Bitcoin\'s unique features make it an attractive alternative to traditional currencies in certain situations. As a result, Bitcoin continues to shape the global conversation around the future of finance.'},
        {'role': 'user', 'content': 'This text gets detected as AI-generated content: Bitcoin is a decentralized digital currency built on blockchain technology that operates without a central bank or administrator. It offers advantages such as low transaction fees, fast processing times, and global accessibility. However, it has faced challenges such as volatility, regulatory scrutiny, and security concerns. \n\n Despite these challenges, Bitcoin remains a popular and innovative digital currency that has the potential to revolutionize the way we think about money and financial transactions. Its value has fluctuated greatly since its creation in 2009, but it has steadily gained popularity and is now one of the most widely used cryptocurrencies in the world. The legality and regulation of Bitcoin varies widely between countries, with some embracing it as a legitimate form of payment while others restrict its use. Nevertheless, Bitcoin is an exciting development in the world of finance and technology that is worth keeping an eye on.'},
        {'role': 'user', 'content': 'I will provide you some text and a percentage score of how likely it is to be AI generated. Use this percentage to determine how much you need to rewrite the text. The higher the percentage the more you need to rewrite. The lower the percentage the less you need to rewrite. So if you get a score of 50% you need to rewrite 50% of the text. If you get a score of 90% you need to rewrite 90% of the text. If you get a score of 10% you need to rewrite 10% of the text. \n'},
    ]);

    const getScore = async (data) => {
        return data.completely_generated_prob * 100;
    }

    const getSentencePerplexities = async (data) => {
        let perplexities = {};
        for (let i = 0; i < data.sentences.length; i++) {
            perplexities[data.sentences[i].sentence] = data.sentences[i].perplexity;
        }
        return perplexities;
    }

    const checkGPTZero = async (input) => {
        const url = 'https://api.gptzero.me/v2/predict/text';
        const data = {
            "document": input,
        }
        const headers = {
            'accept': 'application/json',
            'X-Api-Key': 'abe51e5183134e6bbc31a8257ac4559d',
            'Content-Type': 'application/json'
        }
    
        // Return a Promise
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(url, data, {
                    headers: headers
                });
                setZeroScore(response.data.documents[0]);
                setLoadingGPTZero(false);
                console.log('GPTZero Response:', response.data);
                resolve(response.data.documents[0]);
            } catch (error) {
                console.error('Error fetching sentiment:', error);
                reject(error);
            }
        });
    }

    const createPerplexityPrompt = (perplexities) => {
        let prompt = '';

        for (let sentence in perplexities) {
            // strip sentence of full stop only at the end
            prompt += `${sentence.slice(0, -1)} [Perplexity: ${perplexities[sentence]}].`;
        }

        return prompt;
    }
    const processAPI = async () => {
        if (text !== "") {
            console.log("Running API....");
            setOriginalText(text);
            setLoading(true);
        
            // get the score of the original text and wait for it to finish
            let data = await checkGPTZero(text);
            let percent = await getScore(data);
            let perplexities = await getSentencePerplexities(data);
            setOriginalScore(data);
            console.log("percent", perplexities);
        
            let prompt;
            let rewrittenText = createPerplexityPrompt(perplexities);
            console.log("rewrittenText: ", rewrittenText)
        
            while (percent >= 10) {
                prompt = `Rewrite the following text. Focus on two factors: perplexity and burstiness. The goal is to increase the perplexity and burstiness as needed, meaning be careful not to over do it so ensure it remains readable, a key is varying sentence lengths. Again make sure to heavily avoid obscure words or convoluted sentence structures Here is the percentage: ${percent}%. I will also provide you the perplexity of each sentence to better help you adjust the text. AI tend to write with low perplexity so focus on the sentences with the lowest perplexities the most and obviously don't write the perplexities in your response only the sentences. Here is the text with the perplexities after each sentence: ${rewrittenText}`;
        
                console.log("prompt: ", prompt);
                let response;
                try {
                    response = await openai.createChatCompletion({
                        model: "gpt-4",
                        messages: messages.concat({ role: "user", content: prompt }),
                    });
                    console.log("response: ", response);
                } catch (error) {
                    console.error("Error:", error);
                    setError(true);
                    break;
                }
        
                if (response.data.error) {
                    setError(true);
                    break;
                } else {
                    setError(false);
                    rewrittenText = response.data.choices[0].message.content;
                    data = await checkGPTZero(rewrittenText);
                    percent = await getScore(data);
                    console.log("New percent:", percent);
                }
            }
            
            // if the response contains the [Perplexity: N] string then remove any occurences of it so remove [Perplexity: and the number after it and the closing square bracket
            if (rewrittenText.includes('[Perplexity:')) {
                rewrittenText = rewrittenText.replace(/\[Perplexity: \d+\]/g, ''); // this remove digits of one or more length
                // remove the space before the full stop
                rewrittenText = rewrittenText.replace(/ \./g, '.');
            }
    

            setOutput(rewrittenText);
            setLoading(false);
            setOriginal(true);
        }
      };
      

    // const rewriteText = async (inputText, originalScore) => {
    //     if (originalScore === undefined) {
    //         let data = await checkGPTZero(inputText);
    //         let score = await getScore(data);
    //         setOriginalScore(score);
    //         originalScore = score;
    //         await processAPI(inputText, score);
    //     } else {
    //         await processAPI(inputText, originalScore);
    //     }

    //     if (zeroScore.completely_generated_prob * 100 >= 10) {
    //         await rewriteText(output, originalScore);
    //     }
    // };

    return { processAPI };
}

export default Api;
