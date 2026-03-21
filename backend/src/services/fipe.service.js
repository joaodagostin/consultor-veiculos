const FIPE_BASE_URL = "https://parallelum.com.br/fipe/api/v2/cars";

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao consultar FIPE: ${response.status}`);
  }

  return response.json();
}

function parsePriceToNumber(price) {
  const rawPrice = String(price || "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const parsedPrice = Number(rawPrice);

  if (Number.isNaN(parsedPrice)) {
    throw new Error("Não foi possível converter o valor da FIPE.");
  }

  return parsedPrice;
}

export async function getFipeBrands() {
  return fetchJson(`${FIPE_BASE_URL}/brands`);
}

export async function getFipeModels(brandCode) {
  return fetchJson(`${FIPE_BASE_URL}/brands/${brandCode}/models`);
}

export async function getFipeYears(brandCode, modelCode) {
  return fetchJson(`${FIPE_BASE_URL}/brands/${brandCode}/models/${modelCode}/years`);
}

export async function getFipeVehicle(brandCode, modelCode, yearCode) {
  return fetchJson(
    `${FIPE_BASE_URL}/brands/${brandCode}/models/${modelCode}/years/${yearCode}`
  );
}

export async function getFipeReferenceValueByCodes({
  brandCode,
  modelCode,
  yearCode,
}) {
  const vehicle = await getFipeVehicle(brandCode, modelCode, yearCode);

  return {
    valor: parsePriceToNumber(vehicle.price),
    dadosBrutos: vehicle,
  };
}