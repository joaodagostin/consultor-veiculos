import { Router } from "express";
import { consultarVeiculo } from "../controllers/consulta.controller.js";

const router = Router();

router.post("/", consultarVeiculo);

export default router;