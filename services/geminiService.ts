import { GoogleGenAI } from "@google/genai";
import type { CompanyReputation } from '../types';

export async function analyzeReputation(reputation: CompanyReputation, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error("API Key não fornecida.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analise a reputação de entrega da empresa de financiamento coletivo "${reputation.name}".
    
    Aqui estão os dados:
    - Número total de projetos rastreados: ${reputation.delayedProjectsCount}
    - Média de dias de atraso na entrega: ${Math.round(reputation.averageDelayDays)}
    - Avaliação média dos usuários: ${reputation.averageRating.toFixed(1)} de 5 estrelas.
    
    Com base nesses dados, forneça um resumo curto, de um parágrafo, sobre o desempenho da empresa para um potencial apoiador.
    Incorpore a avaliação média na sua análise.
    Use um tom neutro e informativo. Comece o resumo diretamente, sem preâmbulos.
    Por exemplo: "Com um atraso médio de X dias e uma avaliação de Y estrelas em Z projetos, a [Nome da Empresa] mostra um padrão de..."
    Se o atraso for 0 ou negativo, elogie a pontualidade.
    Responda em português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao analisar reputação com Gemini:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       return "Erro: A chave de API fornecida não é válida. Verifique a chave no painel de administração.";
    }
    return "Erro: Não foi possível gerar a análise da IA. Verifique sua chave de API e conexão com a internet.";
  }
}
