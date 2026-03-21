import { getVehicleAnalysis } from "../services/vehicle.service.js";

export async function consultarVeiculo(req, res, next) {
  try {
    const { brandCode, modelCode, yearCode, preco, km } = req.body;

    if (!brandCode || !modelCode || !yearCode || !preco) {
      return res.status(400).json({
        error: "Os campos brandCode, modelCode, yearCode e preco são obrigatórios.",
      });
    }

    const precoNumero = Number(preco);
    const kmNumero =
      km !== undefined && km !== null && km !== "" ? Number(km) : null;

    if (Number.isNaN(precoNumero) || precoNumero <= 0) {
      return res.status(400).json({
        error: "Preço inválido.",
      });
    }

    if (kmNumero !== null && (Number.isNaN(kmNumero) || kmNumero < 0)) {
      return res.status(400).json({
        error: "KM inválida.",
      });
    }

    const result = await getVehicleAnalysis({
      brandCode,
      modelCode,
      yearCode,
      preco: precoNumero,
      km: kmNumero,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}