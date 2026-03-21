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

function getClassificacaoTexto(score) {
  if (score >= 80) return "Boa compra";
  if (score >= 60) return "Atenção";
  return "Risco alto";
}

function getPrecoSugerido(precoFipe, percentualDiferenca) {
  if (percentualDiferenca >= 15) return precoFipe * 0.9;
  if (percentualDiferenca >= 8) return precoFipe * 0.95;
  if (percentualDiferenca <= -20) return precoFipe * 0.92;
  return precoFipe * 0.97;
}

function buildFallbackAnalysis({
  marca,
  modelo,
  ano,
  preco,
  precoFipe,
  km,
  percentualDiferenca,
  score,
  oportunidade,
}) {
  const classificacao = getClassificacaoTexto(score);
  const precoSugerido = getPrecoSugerido(precoFipe, percentualDiferenca);

  const pontosPositivos = [];
  const pontosAtencao = [];

  if (percentualDiferenca <= -5) {
    pontosPositivos.push("Preço abaixo da FIPE");
  } else if (percentualDiferenca < 8) {
    pontosPositivos.push("Preço relativamente alinhado com a FIPE");
  }

  if (score >= 80) {
    pontosPositivos.push("Indicadores gerais favoráveis para negociação");
  }

  if (percentualDiferenca >= 10) {
    pontosAtencao.push("Preço acima da FIPE");
  }

  if (percentualDiferenca <= -20) {
    pontosAtencao.push("Preço muito abaixo da FIPE, exigindo conferência redobrada");
  }

  if (typeof km === "number" && km > 0) {
    pontosPositivos.push(`Quilometragem informada: ${km.toLocaleString("pt-BR")} km`);
  } else {
    pontosAtencao.push("Quilometragem não informada");
  }

  if (oportunidade === "suspeito") {
    pontosAtencao.push("Diferença de preço pode indicar anúncio de risco");
  } else if (oportunidade === "oportunidade") {
    pontosPositivos.push("Pode representar boa oportunidade se o estado geral estiver coerente");
  }

  if (pontosPositivos.length === 0) {
    pontosPositivos.push("Modelo deve ser avaliado presencialmente antes da decisão");
  }

  if (pontosAtencao.length === 0) {
    pontosAtencao.push("Confirmar histórico, documentação e estado mecânico");
  }

  return [
    `Classificação: ${classificacao}`,
    `Resumo: O ${marca} ${modelo} ${ano} foi avaliado como ${classificacao.toLowerCase()}, com anúncio em ${formatCurrency(preco)} frente à FIPE de ${formatCurrency(precoFipe)}.`,
    `Pontos positivos: ${pontosPositivos.join("; ")}.`,
    `Pontos de atenção: ${pontosAtencao.join("; ")}.`,
    `Recomendação: tente negociar por cerca de ${formatCurrency(precoSugerido)} e só avance após conferir documentação, sinais de colisão, mecânica, pneus, pintura e, se possível, fazer vistoria cautelar.`,
  ].join(" ");
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
  oportunidade = "normal",
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
      oportunidade,
    });
  }

  const precoSugerido = getPrecoSugerido(precoFipe, percentualDiferenca);

  const prompt = `
Você é um especialista em compra de veículos usados no Brasil.

Sua função é analisar se um carro parece ser uma boa compra com base em preço, FIPE, quilometragem, idade e risco percebido do anúncio.

Dados do veículo:
- Marca: ${marca}
- Modelo: ${modelo}
- Ano: ${ano}
- Combustível: ${combustivel || "Não informado"}
- Preço do anúncio: ${formatCurrency(preco)}
- Preço de referência FIPE: ${formatCurrency(precoFipe)}
- Diferença para FIPE: ${percentualDiferenca.toFixed(2)}%
- Quilometragem: ${typeof km === "number" ? `${km.toLocaleString("pt-BR")} km` : "Não informada"}
- Score calculado: ${score}/100 (${getScoreDisplay(score)})
- Situação detectada: ${oportunidade}
- Faixa sugerida para negociação: ${formatCurrency(precoSugerido)}

Responda em português do Brasil.

Siga EXATAMENTE este formato:
Classificação: [Boa compra | Atenção | Risco alto]
Resumo: [1 frase direta]
Pontos positivos: [itens separados por ponto e vírgula]
Pontos de atenção: [itens separados por ponto e vírgula]
Recomendação: [orientação objetiva para o comprador]

Regras:
- Seja direto e útil para um comprador comum
- Não invente histórico ou defeitos não informados
- Considere que preço muito abaixo da FIPE pode ser oportunidade, mas também pode indicar risco
- Se o preço estiver acima da FIPE, diga que a negociação precisa ser mais dura
- Sugira cautela com documentação, histórico, vistoria cautelar e estado mecânico
- Não use markdown
- Não use asteriscos
- Máximo de 6 frases
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
      temperature: 0.5,
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
      oportunidade,
    });
  }
}