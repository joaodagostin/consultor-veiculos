export function calculateAdvancedScore({ preco, precoFipe, ano, km }) {
  let score = 100;

  const percentualDiferenca = ((preco - precoFipe) / precoFipe) * 100;
  const currentYear = new Date().getFullYear();
  const idade = currentYear - ano;

  if (percentualDiferenca <= -30) score -= 45;
  else if (percentualDiferenca <= -25) score -= 35;
  else if (percentualDiferenca <= -15) score -= 25;
  else if (percentualDiferenca <= -5) score -= 10;
  else if (percentualDiferenca >= 20) score -= 20;
  else if (percentualDiferenca >= 10) score -= 10;

  if (idade > 20) score -= 20;
  else if (idade > 15) score -= 15;
  else if (idade > 10) score -= 10;
  else if (idade > 5) score -= 5;

  let kmEsperado = null;

  if (typeof km === "number" && km > 0) {
    kmEsperado = Math.max(idade, 1) * 12000;

    if (km > kmEsperado * 2) score -= 25;
    else if (km > kmEsperado * 1.5) score -= 15;
    else if (km < kmEsperado * 0.4) score -= 10;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    percentualDiferenca,
    classificacao: getScoreLabel(score),
    oportunidade: getOpportunityFlag({
      percentualDiferenca,
      score,
      km,
      kmEsperado,
    }),
  };
}

function getOpportunityFlag({ percentualDiferenca, score, km, kmEsperado }) {
  if (percentualDiferenca <= -25) {
    return "suspeito";
  }

  if (
    percentualDiferenca <= -15 &&
    score >= 70 &&
    (
      typeof km !== "number" ||
      !kmEsperado ||
      km <= kmEsperado * 1.3
    )
  ) {
    return "oportunidade";
  }

  return "normal";
}

export function getScoreLabel(score) {
  if (score >= 80) return "seguro";
  if (score >= 60) return "atencao";
  return "alto_risco";
}

export function getScoreDisplay(score) {
  if (score >= 80) return "🟢 Seguro";
  if (score >= 60) return "🟡 Atenção";
  return "🔴 Alto risco";
}