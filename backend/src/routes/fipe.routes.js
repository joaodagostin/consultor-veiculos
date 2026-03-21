import { Router } from "express";
import {
  listarMarcas,
  listarModelos,
  listarAnos,
} from "../controllers/fipe.controller.js";

const router = Router();

router.get("/marcas", listarMarcas);
router.get("/modelos/:brandCode", listarModelos);
router.get("/anos/:brandCode/:modelCode", listarAnos);

export default router;