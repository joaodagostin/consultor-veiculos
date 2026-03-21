import { getCache, setCache } from "../utils/cache.js";
import { normalizePlate, formatCurrency } from "../utils/format.js";
import { calculateScore, getScoreDisplay } from "../utils/score.js";
import { generateVehicleNarrative } from "./ai.service.js";

async function fetchVehicleDataMock(placa) {
  const fakeDatabase = {
    ABC1234: {
      placa: "ABC1234",
      marca: "Toyota",
      modelo: "Corolla XEI",
      anoModelo: 2020,
      precoFipe: 98500,
      qtdDonos: 2,
      possuiHistoricoRestritivo: false,
    },
    DEF5678: {
      placa: "DEF5678",
      marca: "Honda",
      modelo: "Civic EX",
      anoModelo: 2018,
      precoFipe: 89900,
      qtdDonos: 4,
      possuiHistoricoRestritivo: true,
    },
  };

  const found = fakeDatabase[placa];
  if (found) return found;

  return {
    placa,
    marca: "Volkswagen",
    modelo: "Gol 1.6",
    anoModelo: 2017,
    precoFipe: 46500,
    qtdDonos: 3,
    possuiHistoricoRestritivo: false,
  };
}

export async function getVehicleAnalysis({ placa, precoAnuncio }) {
  const normalizedPlate = normalizePlate(placa);

  const cacheKey = `${normalizedPlate}:${precoAnuncio ?? "sem-preco"}`;
  const cached = getCache(cacheKey);

  if (cached) {
    return {
      ...cached,
      cache: true,
    };
  }

  const vehicleData = await fetchVehicleDataMock(normalizedPlate);

  const scoreData = calculateScore({
    precoFipe: vehicleData.precoFipe,
    precoAnuncio,
    anoModelo: vehicleData.anoModelo,
    qtdDonos: vehicleData.qtdDonos,
    possuiHistoricoRestritivo: vehicleData.possuiHistoricoRestritivo,
  });

  const analise = await generateVehicleNarrative({
    placa: vehicleData.placa,
    marca: vehicleData.marca,
    modelo: vehicleData.modelo,
    anoModelo: vehicleData.anoModelo,
    precoFipe: vehicleData.precoFipe,
    precoAnuncio,
    qtdDonos: vehicleData.qtdDonos,
    possuiHistoricoRestritivo: vehicleData.possuiHistoricoRestritivo,
    percentualDiferenca: scoreData.percentualDiferenca,
    score: scoreData.score,
  });

  const response = {
    placa: vehicleData.placa,
    marca: vehicleData.marca,
    modelo: vehicleData.modelo,
    anoModelo: vehicleData.anoModelo,
    fipe: {
      valor: vehicleData.precoFipe,
      valorFormatado: formatCurrency(vehicleData.precoFipe),
    },
    anuncio: {
      valor: precoAnuncio ?? null,
      valorFormatado:
        typeof precoAnuncio === "number" ? formatCurrency(precoAnuncio) : null,
    },
    indicadores: {
      qtdDonos: vehicleData.qtdDonos,
      possuiHistoricoRestritivo: vehicleData.possuiHistoricoRestritivo,
      percentualDiferenca: scoreData.percentualDiferenca,
    },
    score: {
      valor: scoreData.score,
      classificacao: scoreData.classificacao,
      display: getScoreDisplay(scoreData.score),
    },
    analise,
    cache: false,
  };

  setCache(cacheKey, response);

  return response;
}