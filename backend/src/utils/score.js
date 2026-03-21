export function calculateScore({
  precoFipe,
  precoAnuncio,
  anoModelo,
  qtdDonos,
  possuiHistoricoRestritivo,
}) {
  let score = 100;

  let percentualDiferenca = null;

  if (typeof precoAnuncio === "number" && precoFipe > 0) {
    percentualDiferenca = ((precoAnuncio - precoFipe) / precoFipe) * 100;

    if (percentualDiferenca <= -20) score -= 25;
    else if (percentualDiferenca <= -10) score -= 15;
    else if (percentualDiferenca <= -5) score -= 8;
    else if (percentualDiferenca >= 10) score -= 10;
  }

  if (qtdDonos >= 4) score -= 15;
  else if (qtdDonos >= 2) score -= 8;

  const currentYear = new Date().getFullYear();
  const idadeVeiculo = currentYear - anoModelo;

  if (idadeVeiculo > 10) score -= 10;
  else if (idadeVeiculo > 5) score -= 5;

  if (possuiHistoricoRestritivo) {
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    percentualDiferenca,
    classificacao: getScoreLabel(score),
  };
}

export function getScoreLabel(score) {
  if (score >= 80) return "seguro";
  if (score >= 60) return "atencao";
  return "alto_risco";
}

export function getScoreDisplay(score) {
  if (score >= 80) return "?? Seguro";
  if (score >= 60) return "?? Atenção";
  return "?? Alto risco";
}