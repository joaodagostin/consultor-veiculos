import { useState } from "react";

type ApiResponse = {
  placa: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  fipe: {
    valor: number;
    valorFormatado: string;
  };
  anuncio: {
    valor: number | null;
    valorFormatado: string | null;
  };
  indicadores: {
    qtdDonos: number;
    possuiHistoricoRestritivo: boolean;
    percentualDiferenca: number | null;
  };
  score: {
    valor: number;
    classificacao: string;
    display: string;
  };
  analise: string;
  cache: boolean;
};

export default function VehicleAnalysis() {
  const [placa, setPlaca] = useState("");
  const [precoAnuncio, setPrecoAnuncio] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ApiResponse | null>(null);
  const [erro, setErro] = useState("");

  function formatPlate(value: string) {
    return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setResultado(null);

    const placaLimpa = formatPlate(placa);

    if (!placaLimpa) {
      setErro("Informe a placa do veículo.");
      return;
    }

    setLoading(true);

    try {
      const body: { placa: string; precoAnuncio?: number } = {
        placa: placaLimpa,
      };

      if (precoAnuncio.trim() !== "") {
        const precoNumero = Number(precoAnuncio.replace(",", "."));

        if (Number.isNaN(precoNumero) || precoNumero < 0) {
          throw new Error("Informe um preço válido.");
        }

        body.precoAnuncio = precoNumero;
      }

      const response = await fetch("http://localhost:3001/api/consulta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao consultar veículo.");
      }

      setResultado(data);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(classificacao: string) {
    switch (classificacao) {
      case "seguro":
        return "#166534";
      case "atencao":
        return "#a16207";
      case "alto_risco":
        return "#b91c1c";
      default:
        return "#1f2937";
    }
  }

  function getScoreBackground(classificacao: string) {
    switch (classificacao) {
      case "seguro":
        return "#dcfce7";
      case "atencao":
        return "#fef3c7";
      case "alto_risco":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Consultor Inteligente de Veículos</h1>
          <p style={styles.subtitle}>
            Analise preço, score de risco e sinais importantes antes da compra.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Placa</label>
            <input
              type="text"
              value={placa}
              onChange={(e) => setPlaca(formatPlate(e.target.value))}
              placeholder="ABC1234"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Preço do anúncio (opcional)</label>
            <input
              type="number"
              value={precoAnuncio}
              onChange={(e) => setPrecoAnuncio(e.target.value)}
              placeholder="Ex: 92000"
              style={styles.input}
              min="0"
              step="0.01"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Analisando..." : "Analisar veículo"}
          </button>
        </form>

        {erro && <div style={styles.errorBox}>{erro}</div>}

        {resultado && (
          <div style={styles.resultCard}>
            <div style={styles.topRow}>
              <div>
                <h2 style={styles.vehicleName}>
                  {resultado.marca} {resultado.modelo}
                </h2>
                <p style={styles.vehicleInfo}>
                  Placa: {resultado.placa} • Ano: {resultado.anoModelo}
                </p>
              </div>

              <div
                style={{
                  ...styles.scoreBadge,
                  backgroundColor: getScoreBackground(resultado.score.classificacao),
                  color: getScoreColor(resultado.score.classificacao),
                }}
              >
                <strong style={{ fontSize: "18px" }}>{resultado.score.display}</strong>
                <span style={{ fontSize: "14px" }}>
                  Score: {resultado.score.valor}
                </span>
              </div>
            </div>

            <div style={styles.grid}>
              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Preço FIPE</span>
                <strong style={styles.infoValue}>
                  {resultado.fipe.valorFormatado}
                </strong>
              </div>

              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Preço do anúncio</span>
                <strong style={styles.infoValue}>
                  {resultado.anuncio.valorFormatado ?? "Não informado"}
                </strong>
              </div>

              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Quantidade de donos</span>
                <strong style={styles.infoValue}>
                  {resultado.indicadores.qtdDonos}
                </strong>
              </div>

              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>Histórico restritivo</span>
                <strong style={styles.infoValue}>
                  {resultado.indicadores.possuiHistoricoRestritivo ? "Sim" : "Não"}
                </strong>
              </div>
            </div>

            {resultado.indicadores.percentualDiferenca !== null && (
              <div style={styles.highlightBox}>
                Diferença para FIPE:{" "}
                <strong>
                  {resultado.indicadores.percentualDiferenca.toFixed(2)}%
                </strong>
              </div>
            )}

            <div style={styles.analysisBox}>
              <h3 style={styles.analysisTitle}>Análise inteligente</h3>
              <p style={styles.analysisText}>{resultado.analise}</p>
            </div>

            <div style={styles.footerNote}>
              {resultado.cache
                ? "Resultado retornado do cache."
                : "Resultado gerado em nova consulta."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, rgb(244, 247, 251) 0%, rgb(232, 239, 247) 100%)",
    padding: "32px 16px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "24px",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
  },
  subtitle: {
    marginTop: "8px",
    color: "#4b5563",
    fontSize: "16px",
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "grid",
    gap: "16px",
    marginBottom: "20px",
  },
  fieldGroup: {
    display: "grid",
    gap: "8px",
  },
  label: {
    fontWeight: 700,
    color: "#1f2937",
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "14px 16px",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    border: "none",
    borderRadius: "12px",
    padding: "14px 18px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    backgroundColor: "#111827",
    color: "#ffffff",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "20px",
  },
  resultCard: {
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "grid",
    gap: "20px",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  vehicleName: {
    margin: 0,
    fontSize: "26px",
    color: "#111827",
  },
  vehicleInfo: {
    margin: "8px 0 0 0",
    color: "#6b7280",
    fontSize: "15px",
  },
  scoreBadge: {
    minWidth: "180px",
    borderRadius: "16px",
    padding: "14px 16px",
    display: "grid",
    gap: "4px",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  infoCard: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
    display: "grid",
    gap: "8px",
  },
  infoLabel: {
    fontSize: "13px",
    color: "#6b7280",
  },
  infoValue: {
    fontSize: "18px",
    color: "#111827",
  },
  highlightBox: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "14px 16px",
    fontSize: "15px",
  },
  analysisBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "14px",
    padding: "18px",
    border: "1px solid #e2e8f0",
  },
  analysisTitle: {
    margin: "0 0 10px 0",
    color: "#111827",
    fontSize: "18px",
  },
  analysisText: {
    margin: 0,
    color: "#374151",
    lineHeight: 1.6,
    fontSize: "15px",
  },
  footerNote: {
    fontSize: "13px",
    color: "#6b7280",
  },
};