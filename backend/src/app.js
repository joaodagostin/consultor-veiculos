import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import consultaRoutes from "./routes/consulta.routes.js";
import fipeRoutes from "./routes/fipe.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://consultor-veiculos.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin não permitida pelo CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "consulto-veiculos-backend",
    environment: env.nodeEnv,
  });
});

app.use("/api/consulta", consultaRoutes);
app.use("/api/fipe", fipeRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
  });
});

app.use((err, req, res, next) => {
  console.error("Erro interno:", err);

  res.status(500).json({
    error: "Erro interno do servidor",
    message: env.nodeEnv === "development" ? err.message : undefined,
  });
});

export default app;