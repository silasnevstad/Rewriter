import axios from "axios";
import { useCallback } from "react";
const { Configuration, OpenAIApi } = require("openai");

const presetMessages = [
  {
    role: "system",
    content:
      "IMPORTANT: You are an AI language model, and your goal is to rewrite the provided text, which is currently detected as AI-generated, to convincingly emulate human writing. AI-generated content typically has low perplexity and burstiness, so your task is to increase these values while rewriting. Perplexity measures the randomness of the text, word choices, and sentence lengths, whereas burstiness quantifies the variations in perplexity. The provided text includes the perplexity value for each sentence in parentheses at the end. Focus on increasing perplexity and burstiness, especially for sentences with lower values. While doing so, ensure the text remains readable and understandable and free from overly convoluted words or complicated sentence structures. Your aim is to produce content that fully resembles human writing without losing the original meaning.",
  },
];

const askGPT = async (model, messages, apiKey) => {
    const configuration = new Configuration({ apiKey: apiKey });
    const openai = new OpenAIApi(configuration);
  
    try {
      const response = await openai.createChatCompletion({
        model: model,
        messages: messages,
      });
      return response.data.choices[0].message.content;
    } catch (error) {
    //   console.error("Error in askGPT:", error);
      throw error;
    }
};

  const checkGPTZero = async (text, apiKey) => {
    const url = "https://api.gptzero.me/v2/predict/text";
    const headers = {
      accept: "application/json",
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    };
  
    const data = {
      document: text,
    };
  
    try {
      const response = await axios.post(url, data, { headers });
      const responseData = response.data;
  
      if (isHumanGenerated(responseData.documents[0])) {
        return { isHuman: true, data: responseData.documents[0] };
      }
  
      return { isHuman: false, data: responseData.documents[0] };
    } catch (error) {
    //   console.error("Error in checkGPTZero:", error);
      throw error;
    }
};


  const getSentencePerplexities = (data) => {
    if (!data.sentences) {
      return {};
    }
    const perplexities = {};
    for (let i = 0; i < data.sentences.length; i++) {
      perplexities[data.sentences[i].sentence] = data.sentences[i].perplexity;
    }
    return perplexities;
};

const createPerplexityPrompt = (perplexities) => {
    let prompt = "";
  
    for (const sentence in perplexities) {
      prompt += `${sentence.slice(0, -1)} (${perplexities[sentence]}).`;
    }
  
    return prompt;
};

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
    if (overallPercent < 0.05) {
      return true;
    }
    for (let i = 0; i < data.paragraphs.length; i++) {
      if (data.paragraphs[i].completely_generated_prob > 0.05) {
        return false;
        }
    }
    return true;
}

const cleanResponseString = (response) => {
    let cleanResponse = response.replace(/\[Perplexity: \d+\]/g, "");
  
    cleanResponse = cleanResponse.replace(/\(\d+\)/g, "");
    cleanResponse = cleanResponse.replace(/ +\./g, ".");
    cleanResponse = cleanResponse.replace(/\(\d+\.?\d*\)/g, "");
    cleanResponse = cleanResponse.replace(/\(Perplexity: \d+\.?\d*\)/g, "");
    return cleanResponse;
};

const getHumanizedPrompt = (text, percent) => {
    return `Rewrite the text below, which has been identified as AI-generated with a ${percent}% AI detection rate. The text comes with the perplexity of each sentence in parentheses at the end. Focus on increasing perplexity and burstiness, giving special attention to sentences with lower values, while maintaining readability. Avoid using rare words or complex sentence structures. Your objective is to create content that closely resembles human writing. Here is the text that needs to be rewritten:\n\n${text}`;
};

const sortBestFailedAttempts = (failedAttempts) => {
    const sortedAttempts = failedAttempts.sort((a, b) => {
      const aPercent = a.content.split(" ")[3];
      const bPercent = b.content.split(" ")[3];
      return aPercent - bPercent;
    });
    return sortedAttempts.slice(0, 2);
};

const humanizeFromScore = async (scoreData, chatApiKey, zeroApiKey, failedAttempts = [], maxAttempts = 5) => {
    if (!scoreData) {
      return "";
    }
    const percent = (scoreData.completely_generated_prob * 100).toFixed(2);
    const perplexities = getSentencePerplexities(scoreData);
    const rewrittenText = createPerplexityPrompt(perplexities);
    const prompt = getHumanizedPrompt(rewrittenText, percent);
    const messages = [
      { role: "user", content: prompt },
    ];
    if (failedAttempts.length > 0) {
      const bestAttempt = sortBestFailedAttempts(failedAttempts)[0];
      const worstAttempt = sortBestFailedAttempts(failedAttempts).slice(-1)[0];
      const attempts = [bestAttempt, worstAttempt];
      messages.unshift(...attempts);
      messages.unshift({ role: "system", content: "These are the previous attempts to rewrite the text, each labeled with their AI-generated detection percentage. As you work on improving the text, please consider these earlier attempts and learn from their shortcomings. Your goal is to create a version with increased perplexity and burstiness that more closely resembles human writing while maintaining readability and avoiding rare words or complex sentence structures:" });
    }
  
    messages.unshift(...presetMessages);
  
    try {
      const response = await askGPT("gpt-4", messages, chatApiKey);
      const cleanResponse = cleanResponseString(response);
      const zeroResponse = await checkGPTZero(cleanResponse, zeroApiKey);
      const humanMade = zeroResponse.isHuman;
      const humanAIPercent = zeroResponse.data.completely_generated_prob.toFixed(2) * 100;
  
      if (!humanMade && maxAttempts > 0) {
        failedAttempts.push({ role: "system", content: `Previous attempt was ${humanAIPercent}% AI-like: ${cleanResponse}` });
        return humanizeFromScore(zeroResponse.data, chatApiKey, zeroApiKey, failedAttempts, maxAttempts - 1);
      }

      if (!humanMade && maxAttempts === 0) {
        const bestAttempt = sortBestFailedAttempts(failedAttempts)[0];
        const text = bestAttempt.content.split(": ")[1];
        const score = await checkGPTZero(text, zeroApiKey);
        return { text: text, score: score.data, human: false };
      }
  
      return { text: cleanResponse, score: zeroResponse.data, human: humanMade };
    } catch (error) {
    //   console.error("Error in humanizeFromScore:", error);
      throw error;
    }
};

const humanizeText = async (text, chatApiKey, zeroApiKey) => {
    try {
        const checkResult = await checkGPTZero(text, zeroApiKey);
        if (checkResult.isHuman) {
            return { text: text, score: checkResult.data, human: true};
        }
        return humanizeFromScore(checkResult.data, chatApiKey, zeroApiKey);
    } catch (error) {
        // console.error("Error in humanizeText:", error);
        throw error;
    }
};

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
            let responseAI = await askGPT("gpt-4", [{role: 'user', content: text}], chatGPTApiKey);
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
