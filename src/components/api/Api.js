import axios from 'axios';
const { Configuration, OpenAIApi } = require("openai");

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

const createPerplexityPrompt = (perplexities) => {
    let prompt = '';

    for (let sentence in perplexities) {
        // strip sentence of full stop only at the end
        prompt += `${sentence.slice(0, -1)} [Perplexity: ${perplexities[sentence]}].`;
    }

    return prompt;
}

const cleanResponseString = (response) => {
    let cleanResponse = response.replace(/\[Perplexity: \d+\]/g, '');

    // remove any extra spaces before periods
    cleanResponse = cleanResponse.replace(/ +\./g, '.');

    return cleanResponse;
}

function Api({ text, setLoading, setError, setOutput, setAskOutput, setZeroScore, setOriginalScore, setOriginalText }) {
    const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    const gptZeroApiKey = process.env.REACT_APP_GPT_ZERO_API_KEY;
    
    const configuration = new Configuration({ apiKey: openaiApiKey });
    const openai = new OpenAIApi(configuration);

    const messages = [
        {'role': 'user', 'content': 'I need you to rewrite some text. There are two factors that are important when detecting content as AI or human generated, perplexity and burstiness. Perplexity measures the randomness of the text, words and sentence lengths, and burstiness measures the variation in perplexity. As some examples, I will give you two peices of text one is detected as human generated and one if detected as AI generated, anaylze these to better help you rewrite the text to be human-generated. \n'},
        {'role': 'user', 'content': 'This text gets detected as human-generated content: Bitcoin emerged in 2009 as a decentralized digital currency created by the enigmatic Satoshi Nakamoto. It operates on a peer-to-peer network, removing the need for banks and financial institutions. Using blockchain technology, Bitcoin transactions are secure and transparent. This novel approach to transferring value has gained significant attention and adoption. \n\n However, Bitcoin has faced challenges and controversies. Critics argue its decentralized nature can enable illicit activities and its mining process raises environmental concerns. Nonetheless, Bitcoin\'s unique features make it an attractive alternative to traditional currencies in certain situations. As a result, Bitcoin continues to shape the global conversation around the future of finance.'},
        {'role': 'user', 'content': 'This text gets detected as AI-generated content: Bitcoin is a decentralized digital currency built on blockchain technology that operates without a central bank or administrator. It offers advantages such as low transaction fees, fast processing times, and global accessibility. However, it has faced challenges such as volatility, regulatory scrutiny, and security concerns. \n\n Despite these challenges, Bitcoin remains a popular and innovative digital currency that has the potential to revolutionize the way we think about money and financial transactions. Its value has fluctuated greatly since its creation in 2009, but it has steadily gained popularity and is now one of the most widely used cryptocurrencies in the world. The legality and regulation of Bitcoin varies widely between countries, with some embracing it as a legitimate form of payment while others restrict its use. Nevertheless, Bitcoin is an exciting development in the world of finance and technology that is worth keeping an eye on.'},
        // {'role': 'user', 'content': 'I will provide you some text and a percentage score of how likely it is to be AI generated. Use this percentage to determine how much you need to rewrite the text. The higher the percentage the more you need to rewrite. The lower the percentage the less you need to rewrite. So if you get a score of 50% you need to rewrite 50% of the text. If you get a score of 90% you need to rewrite 90% of the text. If you get a score of 10% you need to rewrite 10% of the text. \n'},
    ];

    const checkGPTZero = async (input) => {
        const url = 'https://api.gptzero.me/v2/predict/text';
        const data = {
            "document": input,
        }
        const headers = {
            'accept': 'application/json',
            'X-Api-Key': gptZeroApiKey,
            'Content-Type': 'application/json'
        }
    
        // Return a Promise
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(url, data, {
                    headers: headers
                });
                setZeroScore(response.data.documents[0]);
                console.log('GPTZero Response:', response.data);
                resolve(response.data.documents[0]);
            } catch (error) {
                console.error('Error fetching sentiment:', error);
                reject(error);
            }
        });
    }

    // asks GPT-4 for a response given messages array
    const askGPT = async (messages, model) => {
        try {
            console.log('Prompting GPT-4...')
            // get response from openAI
            const response = await openai.createChatCompletion({
                model: model,
                messages: messages,
            });
            console.log('GPT-4 Response:', response.data)
            return response;
        } catch (error) {
            console.log(error);
            throw new Error('Error');
        }
    };

    // takes in text to rewrite and returns openAI response.
    const rewriteTextFromPrompt = async (prompt) => {
        let newMessages = messages.concat({'role': 'user', 'content': prompt});
        let response = await askGPT(newMessages, "gpt-4");
        console.log('rewriteText Text:', response.data.choices[0].message.content);
        return response;
    }

    // takes in text to rewrite and returns openAI response.
    const humanizeText = async (scoreData) => {
        console.log('Humanizing Text...')
        let percent = await getScore(scoreData);
        let perplexities = await getSentencePerplexities(scoreData);
        let rewrittenText = createPerplexityPrompt(perplexities);
        let prompt = `Rewrite the following text. Focus on two factors: perplexity and burstiness. The goal is to increase the perplexity and burstiness as needed, meaning be careful not to over do it so ensure it remains readable, a key is varying sentence lengths. Again make sure to heavily avoid obscure words or convoluted sentence structures. I will also provide you the perplexity of each sentence to better help you adjust the text. AI tend to write with low perplexity so focus on the sentences with the lowest perplexities the most and obviously don't write the perplexities in your response only the sentences. Here is the text with the perplexities after each sentence: ${rewrittenText}`;

        let response = await rewriteTextFromPrompt(prompt);
        let text = response.data.choices[0].message.content;

        let data = await checkGPTZero(text);
        let newPercent = await getScore(data);

        if (newPercent >= .1) {
            return humanizeText(data);
        }

        let cleanResponse = cleanResponseString(text);

        // return clean response
        return cleanResponse;
    }


    const processAPI = async () => {
        if (text !== "") {
            console.log("Running API....");
            setLoading(true);
        
            try {
                let data = await checkGPTZero(text);
                let score = await getScore(data);
                setOriginalScore(data);
                setOriginalText(text);

                if (score > 0.1) {
                    let rewrittenText = await humanizeText(data);
                    setOutput(rewrittenText);
                    return;
                } else {
                    setOutput(text);
                }

                setError(false);
            } catch (error) {
                console.log(error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
    };

    const askAPI = async () => {
        if (text !== "") {
            console.log("Asking question to API....");
            setLoading(true);

            try {
                // let data = await checkGPTZero(text);
                // setOriginalScore(data);
                // setOriginalText(text);

                const response = await askGPT([{role: 'user', content: text}], "gpt-4");
                let responseMessage = response.data.choices[0].message.content;
                let data = await checkGPTZero(responseMessage);
                let score = await getScore(data);
                if (score > 5) {
                    responseMessage = await humanizeText(data);
                }
                setError(false);
                setAskOutput(responseMessage);
            } catch (error) {
                console.log(error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
    };


    return { processAPI, askAPI };
}

export default Api;
