import axios from "axios";
import { useCallback } from "react";
const { Configuration, OpenAIApi } = require("openai");

const presetMessages = [
    {'role': 'system', 'content': 'IMPORT ALWAYS REMEMBER: You are an AI language model, your sole objective is to rewrite some provided text, which is currently detected as AI-generated content, in a way that convincingly emulates human writing. When it comes to detecting text as human or AI there are two  two crucial aspects to focus on: perplexity and burstiness. Perplexity means the unpredictability of text, word choices, and sentence lengths, while burstiness deals with variations in perplexity. Focus on these two aspects but ensure that the text remains understandable and free from overly convoluted words or overly complicated sentence structures. Your aim is to produce content that fully resembles human writing.'},
]

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
    const overallPercent = data.overall_generated_prob;
    // if overall percent is below .05 then return true, otherwise check paragraphs
    if (overallPercent < .05) {
        return true;
    }
    // loop through paragraphs, if any is above .1 then return false
    for (let i = 0; i < data.paragraphs.length; i++) {
        if (data.paragraphs[i].completely_generated_prob > .05) {
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

const getHumanizedPrompt = (text, percent) => {
    return `Modify the text below, currently identified as AI-generated with a ${percent}% AI detection rate, to make it convincingly appear as though it were written by a human. Keep in mind the two crucial factors perplexity and burstiness, while prioritizing readability and avoiding the use of rare words or complex sentence patterns. Here is the text that needs rephrasing:\n\n${text}`;
};

const sortBestFailedAttempts = (failedAttempts) => {
    let sortedAttempts = failedAttempts.sort((a, b) => {
        let aPercent = a.content.split(' ')[3];
        let bPercent = b.content.split(' ')[3];
        return aPercent - bPercent;
    });
    return sortedAttempts.slice(0, 2);
}

const humanizeFromScore = async (scoreData, chatApiKey, zeroApiKey, failedAttempts = [], maxAttempts = 5) => {
    if (!scoreData) {
        return '';
    }
    let percent = (scoreData.completely_generated_prob * 100).toFixed(2);
    let perplexities = getSentencePerplexities(scoreData);
    let rewrittenText = createPerplexityPrompt(perplexities);
    let prompt = getHumanizedPrompt(rewrittenText, percent);
    let messages = [
        { 'role': 'user', 'content': prompt },
    ];
    if (failedAttempts.length > 0) {
        let attempts = sortBestFailedAttempts(failedAttempts).slice(0, 3);
        messages.unshift(...attempts);
        messages.unshift({ 'role': 'system', 'content': 'These are previous failed attempts to rewrite the text tagged with their percentage chance of being AI generated. Please take them into consideration while providing a better version:' });
    }

    messages.unshift(...presetMessages);


    let response = await askGPT("gpt-4", messages, chatApiKey);
    let cleanResponse = cleanResponseString(response);
    let zeroResponse = await checkGPTZero(cleanResponse, zeroApiKey);
    let humanMade = zeroResponse.isHuman;
    let humanAIPercent = zeroResponse.data.completely_generated_prob.toFixed(2) * 100;
    let humanAIPercentString = humanAIPercent.toString() + '%';

    if (!humanMade && maxAttempts > 0) {
        failedAttempts.push({ 'role': 'system', 'content': `Previous attempt was ${humanAIPercentString} AI-like: ${cleanResponse}` });
        return humanizeFromScore(zeroResponse.data, chatApiKey, zeroApiKey, failedAttempts, maxAttempts - 1);
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
    }, [text, GPTZeroApiKey, chatGPTApiKey, setLoading, setError, setText, setOutput, setZeroScore, setOriginalScore, setOriginalText]);

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
    }, [text, GPTZeroApiKey, chatGPTApiKey, setLoading, setError, setAskOutput, setZeroScore]);

    return { humanize, askHuman };
}

export default Api;
