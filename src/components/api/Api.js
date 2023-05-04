import axios from "axios";
import { useCallback } from "react";
const { Configuration, OpenAIApi } = require("openai");

const presetMessages = [
  {'role': 'user', 'content': 'I need you to rewrite some text that is currently detected as AI generated to be detected as human generated. There are two factors that are important when detecting content as AI or human generated, perplexity and burstiness. Perplexity measures the randomness of the text, words and sentence lengths, and burstiness measures the variation in perplexity. As some examples, I will give you two peices of text one is detected as human generated and one if detected as AI generated, anaylze these to better help you rewrite the text to be human-generated. \n'},
  {'role': 'user', 'content': 'This text gets detected as human-generated content: Bitcoin emerged in 2009 as a decentralized digital currency created by the enigmatic Satoshi Nakamoto. It operates on a peer-to-peer network, removing the need for banks and financial institutions. Using blockchain technology, Bitcoin transactions are secure and transparent. This novel approach to transferring value has gained significant attention and adoption. \n\n However, Bitcoin has faced challenges and controversies. Critics argue its decentralized nature can enable illicit activities and its mining process raises environmental concerns. Nonetheless, Bitcoin\'s unique features make it an attractive alternative to traditional currencies in certain situations. As a result, Bitcoin continues to shape the global conversation around the future of finance.'},
  {'role': 'user', 'content': 'This text gets detected as AI-generated content: Bitcoin is a decentralized digital currency built on blockchain technology that operates without a central bank or administrator. It offers advantages such as low transaction fees, fast processing times, and global accessibility. However, it has faced challenges such as volatility, regulatory scrutiny, and security concerns. \n\n Despite these challenges, Bitcoin remains a popular and innovative digital currency that has the potential to revolutionize the way we think about money and financial transactions. Its value has fluctuated greatly since its creation in 2009, but it has steadily gained popularity and is now one of the most widely used cryptocurrencies in the world. The legality and regulation of Bitcoin varies widely between countries, with some embracing it as a legitimate form of payment while others restrict its use. Nevertheless, Bitcoin is an exciting development in the world of finance and technology that is worth keeping an eye on.'},
];

const askGPT = async (model, messages, apiKey) => {
    const configuration = new Configuration({ apiKey: apiKey });
    const openai = new OpenAIApi(configuration);

    try {
        const response = await openai.createChatCompletion({
            model: model,
            messages: messages,
        })
        return response.data.choices[0].message.content;
    } catch (error) {
        throw error;
    }
};

const checkGPTZero = async (text, apiKey) => {
    const url = "https://api.gptzero.me/v2/predict/text";
    const headers = {
        "accept": "application/json",
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
    };

    const data = {
        "document": text,
    };

    const response = await axios.post(url, data, { headers });
    const responseData = response.data;

    if (isHumanGenerated(responseData.documents[0])) {
        return { isHuman: true, data: responseData.documents[0] };
    }

    return { isHuman: false, data: responseData.documents[0] };
};


const getSentencePerplexities = (data) => {
    if (!data.sentences) {
        return {};
    }
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
        prompt += `${sentence.slice(0, -1)} (${perplexities[sentence]}).`;
    }

    return prompt;
}

// const stitchSentences = (perplexities) => {
//     let prompt = '';

//     for (let sentence in perplexities) {
//         // string together sentences
//         prompt += `${sentence} `;
//     }

//     return prompt;
// }

const isHumanGenerated = (data) => {
    if (!data.paragraphs) {
        return false;
    }
    // loop through paragraphs, if any is above .1 then return false
    for (let i = 0; i < data.paragraphs.length; i++) {
        if (data.paragraphs[i].completely_generated_prob > .01) {
            return false;
        }
    }
    return true;
}

const cleanResponseString = (response) => {
    let cleanResponse = response.replace(/\[Perplexity: \d+\]/g, '');   

    // remove any (1) or (2) or (3) oe (29.2)
    cleanResponse = cleanResponse.replace(/\(\d+\)/g, '');

    // remove any extra spaces before periods
    cleanResponse = cleanResponse.replace(/ +\./g, '.');

    // remove any occurences of parthensis with a number inside, either with a decimal or not
    cleanResponse = cleanResponse.replace(/\(\d+\.?\d*\)/g, '');

    // remove any occurences of parthensis (Perplexity: 29.2), either with a decimal or not
    cleanResponse = cleanResponse.replace(/\(Perplexity: \d+\.?\d*\)/g, '');
    return cleanResponse;
}

// takes in text to rewrite and returns openAI response.
const rewriteTextFromMessages = async (messages, apiKey) => {
    let response = await askGPT("gpt-4", messages, apiKey);
    return response;
}

const humanizeFromScore = async (scoreData, chatApiKey, zeroApiKey, failedAttempts = []) => {
    if (!scoreData) {
        return '';
    }
    
    let perplexities = getSentencePerplexities(scoreData);
    let rewrittenText = createPerplexityPrompt(perplexities);
    let prompt = `Rewrite the following text. Focus on two factors: perplexity and burstiness. The goal is to increase the perplexity and burstiness as needed, meaning be careful not to over do it so ensure it remains readable, a key is varying sentence lengths. Again make sure to heavily avoid obscure words or convoluted sentence structures. I will also provide you the perplexity of each sentence to better help you adjust the text. AI tend to write with low perplexity so focus on the sentences with the lowest perplexities the most and make sure to remove the perplexities from your response so its only the sentences. Here is the text with the perplexities at the end of each sentence: ${rewrittenText}`;

    let messages = [
        ...failedAttempts,
        { 'role': 'user', 'content': prompt },
    ];

    if (failedAttempts.length > 0) {
        messages.unshift({ 'role': 'system', 'content': 'These are previous failed attempts to rewrite the text. Please take them into consideration while providing a better version:' });
    }

    messages.unshift(...presetMessages);

    let response = await rewriteTextFromMessages(messages, chatApiKey);
    let cleanResponse = cleanResponseString(response);
    let zeroResponse = await checkGPTZero(cleanResponse, zeroApiKey);
    let humanMade = zeroResponse.isHuman;

    if (!humanMade) {
        failedAttempts.push({ 'role': 'system', 'content': `Previous attempt: ${cleanResponse}` });
        return humanizeFromScore(zeroResponse.data, chatApiKey, zeroApiKey, failedAttempts);
    }

    return {'text': cleanResponse, 'score': zeroResponse.data, 'human': humanMade};
}

const humanizeText = async (text, chatApiKey, zeroApiKey) => {
    const checkResult = await checkGPTZero(text, zeroApiKey);

    if (checkResult.isHuman) {
        return {'text': text, 'score': checkResult.data, 'human': true};
    }

    return humanizeFromScore(checkResult.data, chatApiKey, zeroApiKey);
}

function Api({
    text,
    setText,
    setLoading,
    setError,
    setOutput,
    setAskOutput,
    setZeroScore,
    setOriginalScore,
    setOriginalText,
    chatGPTApiKey,
    GPTZeroApiKey
}) {

    // const baseUrl = "https://humangpt-backend.herokuapp.com";

    const humanize = useCallback(async () => {
        if (text === "") {
            return;
        }
        setLoading(true);
        setOriginalText(text);
        let checkResult = await checkGPTZero(text, GPTZeroApiKey);
        if (checkResult.isHuman) {
            setOutput(text);
            setZeroScore(checkResult.data);
            setText("");
            setLoading(false);
            return;
        }
        setOriginalScore(checkResult.data);

        try {
            let response = await humanizeFromScore(checkResult.data, chatGPTApiKey, GPTZeroApiKey);
            setOutput(response.text);
            setText("");
            setZeroScore(response.score);
            setError(false);
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [text]);

    const askHuman = useCallback(async () => {
        if (text === "") {
            return;
        }
        setLoading(true);
        
        try {
            let responseAI = await askGPT("gpt-4", [{'role': 'user', 'content': text}], chatGPTApiKey);
            let response = await humanizeText(responseAI, chatGPTApiKey, GPTZeroApiKey);
            setAskOutput(response.text);
            setZeroScore(response.score);
            setError(false);
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [text]);

    return { humanize, askHuman };
}

export default Api;
