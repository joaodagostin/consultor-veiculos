import OpenAI from "openai";
import { env } from "../config/env.js";
import { formatCurrency } from "../utils/format.js";
import { getScoreDisplay } from "../utils/score.js";

const client = env.geminiApiKey
  ? new OpenAI({
      apiKey: env.geminiApiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    })
  : null;

function buildFallbackAnalysis({
  marca,
  modelo,
  ano,
  preco,
  precoFipe,
  km,
  percentualDiferenca,
  score,
}) {
  const partes = [];

  partes.push(
    `O veículo ${marca} ${modelo} ${ano} recebeu classificação ${getScoreDisplay(score)}.`
  );

  partes.push(
    `O preço informado foi ${formatCurrency(preco)}, enquanto a referência FIPE considerada foi ${formatCurrency(precoFipe)}.`
  );

  if (percentualDiferenca <= -15) {
    partes.push(
      `O valor está bem abaixo da FIPE, o que pode indicar oportunidade, mas também exige atenção com histórico, procedência e estado geral.`
    );
  } else if (percentualDiferenca >= 10) {
    partes.push(
      `O valor está acima da FIPE, então vale avaliar com cuidado se o estado do carro realmente justifica o sobrepreço.`
    );
  } else {
    partes.push(
      `O valor está relativamente alinhado com a FIPE, o que tende a indicar uma faixa de mercado mais previsível.`
    );
  }

  if (typeof km === "number" && km > 0) {
    partes.push(
      `A quilometragem informada foi de ${km.toLocaleString("pt-BR")} km, e ela precisa ser interpretada junto com o ano e o estado de conservação.`
    );
  }

  partes.push(
    `Antes de comprar, vale conferir documentação, sinais de colisão, desgaste mecânico, pneus, pintura e, se possível, fazer vistoria cautelar.`
  );

  return partes.join(" ");
}

export async function generateVehicleNarrative({
  marca,
  modelo,
  ano,
  preco,
  precoFipe,
  km,
  percentualDiferenca,
  score,
  combustivel,
}) {
  if (!client) {
    return buildFallbackAnalysis({
      marca,
      modelo,
      ano,
      preco,
      precoFipe,
      km,
      percentualDiferenca,
      score,
    });
  }

  const prompt = `
Você é um especialista em compra de veículos usados no Brasil.

Analise os dados abaixo e escreva uma avaliação curta, clara e útil para um comprador comum.

Dados do veículo:
- Marca: ${marca}
- Modelo: ${modelo}
- Ano: ${ano}
- Combustível: ${combustivel || "Não informado"}
- Preço do anúncio: ${formatCurrency(preco)}
- Preço de referência FIPE: ${formatCurrency(precoFipe)}
- Diferença percentual para FIPE: ${percentualDiferenca.toFixed(2)}%
- Quilometragem: ${typeof km === "number" ? `${km.toLocaleString("pt-BR")} km` : "Não informada"}
- Score calculado: ${score}/100 (${getScoreDisplay(score)})

Escreva em português do Brasil.

Objetivo:
- Dizer se parece uma boa compra, compra de atenção, ou compra arriscada
- Explicar o que chama atenção no preço
- Explicar riscos possíveis
- Dizer o que a pessoa deve verificar antes de fechar negócio

Regras:
- Seja objetivo
- Não invente histórico que não foi informado
- Não use markdown
- Responda em no máximo 6 frases
`.trim();

  try {
    const response = await client.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const text = response.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error("Resposta vazia da IA.");
    }

    return text;
  } catch (error) {
    console.error("[ai.service] Falha ao gerar análise com Gemini:", error.message);

    return buildFallbackAnalysis({
      marca,
      modelo,
      ano,
      preco,
      precoFipe,
      km,
      percentualDiferenca,
      score,
    });
  }
}