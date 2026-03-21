import { env } from "../config/env.js";

export async function consultarInfosimples(placa) {
  const url = "https://api.infosimples.com/api/v2/consultas/detran/sc/veiculo";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.infosimplesToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      placa
    })
  });

  if (!response.ok) {
    throw new Error("Erro ao consultar Infosimples");
  }

  const data = await response.json();

  return data;
}