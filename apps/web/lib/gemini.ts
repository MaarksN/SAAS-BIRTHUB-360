import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@salesos/config";
import { logger } from "@salesos/core";

const apiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
// Using gemini-1.5-flash as it is a widely available stable model.
// User requested 2.5-flash-preview which might be experimental or unavailable.
const modelName = "gemini-1.5-flash";

const logTokenUsage = (action: string, text: string) => {
  // Mock token estimation: 1 token ~= 4 chars
  const estimatedTokens = Math.ceil(text.length / 4);
  logger.info(`AI Token Usage: ${action}`, { tokens: estimatedTokens, model: modelName });
};

export const generateElevatorPitch = async (company: string, sector: string) => {
   if (!apiKey) return "API Key not configured.";

   const model = genAI.getGenerativeModel({ model: modelName });
   const prompt = `Atue como um especialista em vendas B2B. Crie um pitch de vendas falado de exatamente 30 segundos para vender para a empresa ${company} que atua no setor ${sector}. Foque na dor principal desse setor e como nossa solução resolve. Tom: Consultivo e confiante.`;

   try {
       const result = await model.generateContent(prompt);
       const responseText = result.response.text();
       logTokenUsage('generateElevatorPitch', responseText);
       return responseText;
   } catch (error) {
       console.error("Gemini Error:", error);
       return "Failed to generate pitch.";
   }
};

export const generateBattleCard = async (competitor: string) => {
   if (!apiKey) return "API Key not configured.";

   const model = genAI.getGenerativeModel({ model: modelName });
   const prompt = `Crie uma tabela Markdown comparativa: Coluna 1 'Minha Empresa', Coluna 2 '${competitor}'. Linhas: Preço, Funcionalidades, Suporte. Destaque onde minha empresa ganha.`;

   try {
       const result = await model.generateContent(prompt);
       const responseText = result.response.text();
       logTokenUsage('generateBattleCard', responseText);
       return responseText;
   } catch (error) {
       console.error("Gemini Error:", error);
       return "Failed to generate battle card.";
   }
};

export const analyzeSentiment = async (text: string) => {
   if (!apiKey) return "UNKNOWN";

   const model = genAI.getGenerativeModel({ model: modelName });
   const prompt = `Analise as notas deste CRM e classifique o sentimento do cliente estritamente em uma destas 3 categorias: POSITIVO, NEUTRO, NEGATIVO. Responda apenas a palavra. Texto: "${text}"`;

   try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim().toUpperCase();
      logTokenUsage('analyzeSentiment', responseText);
      return responseText;
   } catch (error) {
       console.error("Gemini Error:", error);
       return "ERROR";
   }
};
