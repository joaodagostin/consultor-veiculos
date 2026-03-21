import { formatCurrency } from "../utils/format.js";
import { calculateAdvancedScore, getScoreDisplay } from "../utils/score.js";
import { generateVehicleNarrative } from "./ai.service.js";
import { getFipeReferenceValueByCodes } from "./fipe.service.js";

function extractAnoFromYearCode(yearCode) {
  const yearPart = String(yearCode).split("-")[0];
  return Number(yearPart);
}

export async function getVehicleAnalysis({
  brandCode,
  modelCode,
  yearCode,
  preco,
  km,
}) {
  const { valor: precoFipe, dadosBrutos } = await getFipeReferenceValueByCodes({
    brandCode,
    modelCode,
    yearCode,
  });

  const marca = dadosBrutos.brand;
  const modelo = dadosBrutos.model;
  const ano = dadosBrutos.modelYear || extractAnoFromYearCode(yearCode);
  const combustivel = dadosBrutos.fuel;

  const scoreData = calculateAdvancedScore({
    preco,
    precoFipe,
    ano,
    km,
  });

  const analise = await generateVehicleNarrative({
    marca,
    modelo,
    ano,
    preco,
    precoFipe,
    km,
    percentualDiferenca: scoreData.percentualDiferenca,
    score: scoreData.score,
    combustivel,
  });

  return {
    veiculo: {
      marca,
      modelo,
      ano,
      km,
      combustivel,
      codigoFipe: dadosBrutos.fipeCode,
      mesReferencia: dadosBrutos.referenceMonth,
    },
    fipe: {
      valor: precoFipe,
      valorFormatado: formatCurrency(precoFipe),
    },
    anuncio: {
      valor: preco,
      valorFormatado: formatCurrency(preco),
    },
    comparativo: {
      percentualDiferenca: scoreData.percentualDiferenca,
    },
    score: {
      valor: scoreData.score,
      classificacao: scoreData.classificacao,
      display: getScoreDisplay(scoreData.score),
    },
    analise,
  };
}