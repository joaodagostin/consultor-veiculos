import { getVehicleAnalysis } from "../services/vehicle.service.js";

export async function consultarVeiculo(req, res, next) {
  try {
    const { placa, precoAnuncio } = req.body;

    if (!placa || typeof placa !== "string") {
      return res.status(400).json({
        error: "O campo 'placa' é obrigatório.",
      });
    }

    if (
      precoAnuncio !== undefined &&
      (typeof precoAnuncio !== "number" || Number.isNaN(precoAnuncio) || precoAnuncio < 0)
    ) {
      return res.status(400).json({
        error: "O campo 'precoAnuncio' deve ser um número válido.",
      });
    }

    const result = await getVehicleAnalysis({
      placa,
      precoAnuncio,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}