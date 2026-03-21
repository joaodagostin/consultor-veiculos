import {
  getFipeBrands,
  getFipeModels,
  getFipeYears,
} from "../services/fipe.service.js";

export async function listarMarcas(req, res, next) {
  try {
    const marcas = await getFipeBrands();
    return res.status(200).json(marcas);
  } catch (error) {
    next(error);
  }
}

export async function listarModelos(req, res, next) {
  try {
    const { brandCode } = req.params;

    if (!brandCode) {
      return res.status(400).json({
        error: "brandCode é obrigatório.",
      });
    }

    const modelos = await getFipeModels(brandCode);
    return res.status(200).json(modelos);
  } catch (error) {
    next(error);
  }
}

export async function listarAnos(req, res, next) {
  try {
    const { brandCode, modelCode } = req.params;

    if (!brandCode || !modelCode) {
      return res.status(400).json({
        error: "brandCode e modelCode são obrigatórios.",
      });
    }

    const anos = await getFipeYears(brandCode, modelCode);
    return res.status(200).json(anos);
  } catch (error) {
    next(error);
  }
}