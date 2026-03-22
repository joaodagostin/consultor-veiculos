import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "";

type FipeOption = {
  code: string;
  name: string;
};

type ApiResponse = {
  veiculo: {
    marca: string;
    modelo: string;
    ano: number;
    km: number | null;
    combustivel?: string;
    codigoFipe?: string;
    mesReferencia?: string;
  };
  fipe: {
    valor: number;
    valorFormatado: string;
  };
  anuncio: {
    valor: number;
    valorFormatado: string;
  };
  comparativo: {
    percentualDiferenca: number;
  };
  score: {
    valor: number;
    classificacao: string;
    display: string;
  };
  analise: string;
};

type SearchableSelectProps = {
  label: string;
  placeholder: string;
  options: FipeOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function useWindowWidth() {
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

function SearchableSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  loading = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.code === value) || null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const term = normalizeText(search.trim());
    if (!term) return options.slice(0, 100);

    return options
      .filter((option) => normalizeText(option.name).includes(term))
      .slice(0, 100);
  }, [options, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      style={{
        ...styles.fieldGroup,
        opacity: disabled ? 0.55 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <label style={styles.label}>{label}</label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          ...styles.searchableTrigger,
          ...(open ? styles.searchableTriggerOpen : {}),
        }}
      >
        <span style={styles.searchableTriggerText}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <span style={styles.chevron}>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div style={styles.dropdownInline}>
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={loading ? "Carregando..." : "Pesquisar..."}
            style={styles.dropdownSearch}
          />

          <div style={styles.dropdownList}>
            {loading ? (
              <div style={styles.dropdownEmpty}>Carregando opções...</div>
            ) : filteredOptions.length === 0 ? (
              <div style={styles.dropdownEmpty}>Nenhum resultado encontrado.</div>
            ) : (
              filteredOptions.map((option) => {
                const active = option.code === value;

                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => {
                      onChange(option.code);
                      setOpen(false);
                    }}
                    style={{
                      ...styles.dropdownItem,
                      ...(active ? styles.dropdownItemActive : {}),
                    }}
                  >
                    <span style={styles.dropdownItemText}>{option.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VehicleAnalysis() {
  const width = useWindowWidth();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1080;

  const [marcas, setMarcas] = useState<FipeOption[]>([]);
  const [modelos, setModelos] = useState<FipeOption[]>([]);
  const [anos, setAnos] = useState<FipeOption[]>([]);

  const [brandCode, setBrandCode] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [yearCode, setYearCode] = useState("");

  const [preco, setPreco] = useState("");
  const [km, setKm] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingAnos, setLoadingAnos] = useState(false);

  const [resultado, setResultado] = useState<ApiResponse | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarMarcas() {
      setLoadingMarcas(true);
      try {
        const response = await fetch(`${API_BASE}/api/fipe/marcas`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao carregar marcas.");
        }

        setMarcas(data);
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Erro ao carregar marcas.");
      } finally {
        setLoadingMarcas(false);
      }
    }

    carregarMarcas();
  }, []);

  useEffect(() => {
    async function carregarModelos() {
      if (!brandCode) {
        setModelos([]);
        setModelCode("");
        setAnos([]);
        setYearCode("");
        return;
      }

      setLoadingModelos(true);
      setErro("");

      try {
        const response = await fetch(
          `${API_BASE}/api/fipe/modelos/${brandCode}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao carregar modelos.");
        }

        setModelos(data);
        setModelCode("");
        setAnos([]);
        setYearCode("");
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Erro ao carregar modelos.");
      } finally {
        setLoadingModelos(false);
      }
    }

    carregarModelos();
  }, [brandCode]);

  useEffect(() => {
    async function carregarAnos() {
      if (!brandCode || !modelCode) {
        setAnos([]);
        setYearCode("");
        return;
      }

      setLoadingAnos(true);
      setErro("");

      try {
        const response = await fetch(
          `${API_BASE}/api/fipe/anos/${brandCode}/${modelCode}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao carregar anos.");
        }

        setAnos(data);
        setYearCode("");
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Erro ao carregar anos.");
      } finally {
        setLoadingAnos(false);
      }
    }

    carregarAnos();
  }, [brandCode, modelCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setResultado(null);

    if (!brandCode || !modelCode || !yearCode || !preco.trim()) {
      setErro("Selecione marca, modelo, ano e informe o preço.");
      return;
    }

    setLoading(true);

    try {
      const precoNumero = Number(preco.replace(",", "."));
      const kmNumero = km.trim() !== "" ? Number(km.replace(",", ".")) : null;

      if (Number.isNaN(precoNumero) || precoNumero <= 0) {
        throw new Error("Informe um preço válido.");
      }

      if (kmNumero !== null && (Number.isNaN(kmNumero) || kmNumero < 0)) {
        throw new Error("Informe uma quilometragem válida.");
      }

      const response = await fetch(`${API_BASE}/api/consulta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandCode,
          modelCode,
          yearCode,
          preco: precoNumero,
          km: kmNumero,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao analisar veículo.");
      }

      setResultado(data);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function getScoreTone(classificacao: string) {
    switch (classificacao) {
      case "seguro":
        return {
          color: "#86efac",
          background: "rgba(34, 197, 94, 0.12)",
          border: "1px solid rgba(34, 197, 94, 0.24)",
        };
      case "atencao":
        return {
          color: "#fde68a",
          background: "rgba(245, 158, 11, 0.12)",
          border: "1px solid rgba(245, 158, 11, 0.24)",
        };
      case "alto_risco":
        return {
          color: "#fca5a5",
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.24)",
        };
      default:
        return {
          color: "#e5e7eb",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
        };
    }
  }

  const scoreTone = resultado ? getScoreTone(resultado.score.classificacao) : null;
  const canSubmit = !!(brandCode && modelCode && yearCode && preco.trim() && !loading);

  const formGridStyle: React.CSSProperties = isMobile
    ? {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "16px",
        alignItems: "start",
      }
    : isTablet
    ? {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "16px",
        alignItems: "start",
      }
    : {
        display: "grid",
        gridTemplateColumns: "2fr 3.2fr 2fr 2fr 1.6fr",
        gap: "18px",
        alignItems: "start",
      };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.hero}>
          <div style={styles.heroBadge}>Análise inteligente</div>
          <h1
            style={{
              ...styles.title,
              fontSize: isMobile ? "42px" : width < 1200 ? "56px" : "64px",
            }}
          >
            Consultor de veículos
          </h1>
          <p style={styles.subtitle}>
            Escolha o veículo pela base FIPE, informe preço e quilometragem, e
            receba uma leitura rápida e clara antes de fechar negócio.
          </p>
        </div>

        <div style={styles.panel}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={formGridStyle}>
              <SearchableSelect
                label="Marca"
                placeholder="Selecione a marca"
                options={marcas}
                value={brandCode}
                onChange={setBrandCode}
                loading={loadingMarcas}
              />

              <SearchableSelect
                label="Modelo"
                placeholder="Selecione o modelo"
                options={modelos}
                value={modelCode}
                onChange={setModelCode}
                disabled={!brandCode}
                loading={loadingModelos}
              />

              <SearchableSelect
                label="Ano / combustível"
                placeholder="Selecione o ano"
                options={anos}
                value={yearCode}
                onChange={setYearCode}
                disabled={!modelCode}
                loading={loadingAnos}
              />

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Preço do anúncio</label>
                <input
                  type="number"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="Ex: 47900"
                  style={styles.input}
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>KM</label>
                <input
                  type="number"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  placeholder="Opcional"
                  style={styles.input}
                  min="0"
                />
              </div>
            </div>

            <div style={styles.actions}>
              <button
                type="submit"
                style={{
                  ...styles.primaryButton,
                  ...(canSubmit ? {} : styles.primaryButtonDisabled),
                  width: isMobile ? "100%" : "auto",
                }}
                disabled={!canSubmit}
              >
                {loading ? "Analisando..." : "Analisar veículo"}
              </button>
            </div>
          </form>

          {erro && <div style={styles.errorBox}>{erro}</div>}
        </div>

        {resultado && scoreTone && (
          <div style={styles.resultPanel}>
            <div style={styles.resultTop}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={styles.resultKicker}>Resultado</div>
                <h2 style={styles.vehicleName}>
                  {resultado.veiculo.marca} {resultado.veiculo.modelo}
                </h2>
                <p style={styles.vehicleMeta}>
                  {resultado.veiculo.ano}
                  {resultado.veiculo.combustivel
                    ? ` • ${resultado.veiculo.combustivel}`
                    : ""}
                  {resultado.veiculo.km !== null
                    ? ` • ${resultado.veiculo.km.toLocaleString("pt-BR")} km`
                    : ""}
                </p>
              </div>

              <div
                style={{
                  ...styles.scoreCard,
                  color: scoreTone.color,
                  background: scoreTone.background,
                  border: scoreTone.border,
                  width: isMobile ? "100%" : "190px",
                }}
              >
                <span style={styles.scoreLabel}>Score</span>
                <strong style={styles.scoreDisplay}>{resultado.score.display}</strong>
                <span style={styles.scoreValue}>{resultado.score.valor}/100</span>
              </div>
            </div>

            <div
              style={{
                ...styles.metricsGrid,
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fit, minmax(210px, 1fr))",
              }}
            >
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Preço FIPE</span>
                <strong style={styles.metricValue}>
                  {resultado.fipe.valorFormatado}
                </strong>
              </div>

              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Preço do anúncio</span>
                <strong style={styles.metricValue}>
                  {resultado.anuncio.valorFormatado}
                </strong>
              </div>

              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Diferença</span>
                <strong style={styles.metricValue}>
                  {resultado.comparativo.percentualDiferenca.toFixed(2)}%
                </strong>
              </div>

              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Código FIPE</span>
                <strong style={styles.metricValue}>
                  {resultado.veiculo.codigoFipe || "-"}
                </strong>
              </div>
            </div>

            <div style={styles.analysisCard}>
              <div style={styles.analysisHeader}>
                <span style={styles.analysisDot} />
                <h3 style={styles.analysisTitle}>Leitura do anúncio</h3>
              </div>
              <p style={styles.analysisText}>{resultado.analise}</p>
            </div>

            <div style={styles.footerRow}>
              <span style={styles.footerItem}>
                Referência: {resultado.veiculo.mesReferencia || "-"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #171717 0%, #0b0b0c 40%, #050505 100%)",
    color: "#f3f4f6",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "32px 16px 56px",
    boxSizing: "border-box",
  },

  shell: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gap: "24px",
  },

  hero: {
    display: "grid",
    gap: "12px",
    paddingTop: "8px",
  },

  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#d1d5db",
    fontSize: "12px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    backdropFilter: "blur(8px)",
  },

  title: {
    margin: 0,
    lineHeight: 0.98,
    fontWeight: 700,
    letterSpacing: "-0.05em",
  },

  subtitle: {
    margin: 0,
    maxWidth: "760px",
    color: "#a1a1aa",
    fontSize: "16px",
    lineHeight: 1.8,
  },

  panel: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "24px",
    backdropFilter: "blur(18px)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  },

  form: {
    display: "grid",
    gap: "18px",
  },

  fieldGroup: {
    display: "grid",
    gap: "8px",
    minWidth: 0,
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#d1d5db",
    paddingLeft: "2px",
  },

  input: {
    height: "52px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(8, 8, 10, 0.95)",
    color: "#f3f4f6",
    padding: "0 16px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
    width: "100%",
    minWidth: 0,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-start",
    paddingTop: "2px",
  },

  primaryButton: {
    height: "50px",
    padding: "0 20px",
    border: "none",
    borderRadius: "16px",
    background: "#f3f4f6",
    color: "#0b0b0c",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    letterSpacing: "-0.01em",
    boxShadow: "0 12px 30px rgba(255,255,255,0.08)",
    transition: "all 0.18s ease",
  },

  primaryButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  errorBox: {
    marginTop: "2px",
    borderRadius: "18px",
    padding: "14px 16px",
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.18)",
    color: "#fca5a5",
    fontSize: "14px",
  },

  resultPanel: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.025))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "24px",
    backdropFilter: "blur(18px)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    display: "grid",
    gap: "22px",
  },

  resultTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },

  resultKicker: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#71717a",
    marginBottom: "8px",
  },

  vehicleName: {
    margin: 0,
    fontSize: "clamp(28px, 3vw, 38px)",
    lineHeight: 1.06,
    letterSpacing: "-0.04em",
    overflowWrap: "anywhere",
  },

  vehicleMeta: {
    margin: "10px 0 0 0",
    color: "#9ca3af",
    fontSize: "15px",
  },

  scoreCard: {
    minWidth: 0,
    borderRadius: "20px",
    padding: "16px 18px",
    display: "grid",
    gap: "4px",
    boxSizing: "border-box",
  },

  scoreLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    opacity: 0.86,
  },

  scoreDisplay: {
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },

  scoreValue: {
    fontSize: "13px",
    opacity: 0.9,
  },

  metricsGrid: {
    display: "grid",
    gap: "14px",
  },

  metricCard: {
    borderRadius: "20px",
    padding: "18px",
    background: "rgba(9, 10, 12, 0.96)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "grid",
    gap: "8px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
    minWidth: 0,
  },

  metricLabel: {
    fontSize: "12px",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  metricValue: {
    fontSize: "19px",
    color: "#f3f4f6",
    letterSpacing: "-0.02em",
    overflowWrap: "anywhere",
  },

  analysisCard: {
    borderRadius: "22px",
    padding: "20px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  analysisHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },

  analysisDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#f3f4f6",
    display: "inline-block",
  },

  analysisTitle: {
    margin: 0,
    fontSize: "16px",
    letterSpacing: "-0.02em",
  },

  analysisText: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: 1.85,
    fontSize: "15px",
  },

  footerRow: {
    display: "flex",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },

  footerItem: {
    color: "#6b7280",
    fontSize: "13px",
  },

  searchableTrigger: {
    width: "100%",
    height: "52px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(8, 8, 10, 0.95)",
    color: "#f3f4f6",
    padding: "0 16px",
    fontSize: "15px",
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
    minWidth: 0,
  },

  searchableTriggerOpen: {
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.02)",
  },

  searchableTriggerText: {
    flex: 1,
    minWidth: 0,
    color: "#f3f4f6",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "left",
    paddingRight: "14px",
  },

  chevron: {
    color: "#9ca3af",
    marginLeft: "10px",
    flexShrink: 0,
    fontSize: "12px",
  },

  dropdownInline: {
    marginTop: "10px",
    background: "rgba(12, 12, 14, 0.98)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 24px 50px rgba(0,0,0,0.30)",
    backdropFilter: "blur(18px)",
  },

  dropdownSearch: {
    width: "100%",
    height: "48px",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "transparent",
    color: "#f3f4f6",
    padding: "0 14px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  dropdownList: {
    maxHeight: "240px",
    overflowY: "auto",
    display: "grid",
  },

  dropdownItem: {
    border: "none",
    background: "transparent",
    color: "#e5e7eb",
    textAlign: "left",
    padding: "12px 14px",
    cursor: "pointer",
    fontSize: "14px",
  },

  dropdownItemActive: {
    background: "rgba(255,255,255,0.08)",
  },

  dropdownItemText: {
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  dropdownEmpty: {
    padding: "14px",
    color: "#6b7280",
    fontSize: "14px",
  },
};