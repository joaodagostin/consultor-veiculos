
export function calculateAdvancedScore({ preco, precoFipe, ano, km }) {
  let score = 100;

  const percentualDiferenca = ((preco - precoFipe) / precoFipe) * 100;

  if (percentualDiferenca <= -20) score -= 30;
  else if (percentualDiferenca <= -10) score -= 20;
  else if (percentualDiferenca <= -5) score -= 10;
  else if (percentualDiferenca >= 15) score -= 10;

  const currentYear = new Date().getFullYear();
  const idade = currentYear - ano;

  if (idade > 10) score -= 10;
  else if (idade > 5) score -= 5;

  if (typeof km === "number" && km > 0) {
    const kmEsperado = idade * 12000;

    if (km > kmEsperado * 1.5) score -= 15;
    else if (km < kmEsperado * 0.5) score -= 10;
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
  if (score >= 80) return "🟢 Seguro";
  if (score >= 60) return "🟡 Atenção";
  return "🔴 Alto risco";
}