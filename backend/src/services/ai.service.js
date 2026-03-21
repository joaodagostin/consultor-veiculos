import { formatCurrency } from "../utils/format.js";
import { getScoreDisplay } from "../utils/score.js";

export async function generateVehicleNarrative({
  placa,
  marca,
  modelo,
  anoModelo,
  precoFipe,
  precoAnuncio,
  qtdDonos,
  possuiHistoricoRestritivo,
  percentualDiferenca,
  score,
}) {
  const partes = [];

  partes.push(
    `O veículo ${marca} ${modelo} ${anoModelo}, placa ${placa}, recebeu classificação ${getScoreDisplay(score)}.`
  );

  if (typeof precoAnuncio === "number") {
    if (percentualDiferenca !== null && percentualDiferenca <= -15) {
      partes.push(
        `O preço anunciado (${formatCurrency(precoAnuncio)}) está bem abaixo da FIPE (${formatCurrency(precoFipe)}), o que pode representar oportunidade, mas também exige investigação cuidadosa antes da compra.`
      );
    } else if (percentualDiferenca !== null && percentualDiferenca >= 10) {
      partes.push(
        `O preço anunciado (${formatCurrency(precoAnuncio)}) está acima da FIPE (${formatCurrency(precoFipe)}), então pode haver sobrepreço dependendo do estado real do veículo e dos opcionais.`
      );
    } else {
      partes.push(
        `O preço anunciado (${formatCurrency(precoAnuncio)}) está em faixa próxima da FIPE (${formatCurrency(precoFipe)}), o que reduz suspeitas relacionadas a preço fora do padrão.`
      );
    }
  } else {
    partes.push(
      `Como o preço do anúncio não foi informado, a análise ficou mais focada em perfil do veículo e sinais de risco, usando a FIPE de ${formatCurrency(precoFipe)} como referência.`
    );
  }

  if (qtdDonos >= 4) {
    partes.push(
      `A quantidade de proprietários é alta, o que pode indicar revendas frequentes e menor previsibilidade sobre o histórico de uso.`
    );
  } else if (qtdDonos >= 2) {
    partes.push(
      `O veículo já passou por mais de um proprietário, o que merece atenção adicional na checagem documental e mecânica.`
    );
  } else {
    partes.push(
      `A baixa quantidade de proprietários tende a favorecer a rastreabilidade do histórico do veículo.`
    );
  }

  if (possuiHistoricoRestritivo) {
    partes.push(
      `Foi identificado histórico relevante ou restritivo, então a recomendação é não fechar negócio sem vistoria cautelar, laudo completo e conferência documental.`
    );
  } else {
    partes.push(
      `Não houve sinal restritivo relevante neste retorno inicial, o que melhora a percepção de segurança, embora não substitua uma vistoria profissional.`
    );
  }

  partes.push(
    `Antes de comprar, vale conferir estrutura, pintura, alinhamento, documentação, procedência e fazer vistoria cautelar.`
  );

  return partes.join(" ");
}