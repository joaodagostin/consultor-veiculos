import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Car,
  Bike,
  Truck,
  Search,
  Sparkles,
  CalendarDays,
  Fuel,
  BadgeDollarSign,
} from "lucide-react";

const API_BASE = "https://parallelum.com.br/fipe/api/v2";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMTQzMjQ0NS1lOGZkLTQ2YzgtODA0Yy0xOWI3MDU3OTNmZWQiLCJlbWFpbCI6ImpvYW8uNDAzMTE0QGFsdW5vc2F0Yy5lZHUuYnIiLCJpYXQiOjE3NzM3MDE0NjZ9.V_IFeJRe2O4keiI0KMSeh-T1di5_o9CFdY-62u5eLpo";

type VehicleType = "cars" | "motorcycles" | "trucks";

type FipeOption = {
  code: string;
  name: string;
};

type FipeResponse = {
  brand: string;
  model: string;
  modelYear: number;
  fuel: string;
  price: string;
  fipeCode: string;
  referenceMonth: string;
  vehicleType: number;
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

type InfoProps = {
  label: string;
  value: string;
  destaque?: boolean;
  icon?: ReactNode;
  style?: React.CSSProperties;
};

const vehicleTypeOptions: {
  value: VehicleType;
  label: string;
  subtitle: string;
  icon: ReactNode;
}[] = [
  {
    value: "cars",
    label: "Carros",
    subtitle: "Automóveis e utilitários",
    icon: <Car className="h-5 w-5" />,
  },
  {
    value: "motorcycles",
    label: "Motos",
    subtitle: "Modelos de duas rodas",
    icon: <Bike className="h-5 w-5" />,
  },
  {
    value: "trucks",
    label: "Caminhões",
    subtitle: "Linha pesada e comercial",
    icon: <Truck className="h-5 w-5" />,
  },
];

export default function App() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("cars");

  const [brands, setBrands] = useState<FipeOption[]>([]);
  const [models, setModels] = useState<FipeOption[]>([]);
  const [years, setYears] = useState<FipeOption[]>([]);

  const [brandId, setBrandId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [yearId, setYearId] = useState<string>("");

  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [loadingYears, setLoadingYears] = useState<boolean>(false);
  const [loadingResult, setLoadingResult] = useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [data, setData] = useState<FipeResponse | null>(null);

  useEffect(() => {
    carregarMarcas();
  }, [vehicleType]);

  useEffect(() => {
    if (brandId) {
      carregarModelos(brandId);
    }
  }, [brandId]);

  useEffect(() => {
    if (brandId && modelId) {
      carregarAnos(brandId, modelId);
    }
  }, [brandId, modelId]);

  const selectedVehicle = useMemo(
    () => vehicleTypeOptions.find((item) => item.value === vehicleType),
    [vehicleType]
  );

  async function requestJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
		Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async function carregarMarcas() {
    setLoadingBrands(true);
    setError("");
    setData(null);

    setBrands([]);
    setModels([]);
    setYears([]);
    setBrandId("");
    setModelId("");
    setYearId("");

    try {
      const json = await requestJson<FipeOption[]>(
        `${API_BASE}/${vehicleType}/brands`
      );
      setBrands(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar marcas");
    } finally {
      setLoadingBrands(false);
    }
  }

  async function carregarModelos(selectedBrandId: string) {
    setLoadingModels(true);
    setError("");
    setData(null);

    setModels([]);
    setYears([]);
    setModelId("");
    setYearId("");

    try {
      const json = await requestJson<FipeOption[]>(
        `${API_BASE}/${vehicleType}/brands/${selectedBrandId}/models`
      );
      setModels(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar modelos");
    } finally {
      setLoadingModels(false);
    }
  }

  async function carregarAnos(
    selectedBrandId: string,
    selectedModelId: string
  ) {
    setLoadingYears(true);
    setError("");
    setData(null);

    setYears([]);
    setYearId("");

    try {
      const json = await requestJson<FipeOption[]>(
        `${API_BASE}/${vehicleType}/brands/${selectedBrandId}/models/${selectedModelId}/years`
      );
      setYears(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar anos");
    } finally {
      setLoadingYears(false);
    }
  }

  async function consultarFipe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingResult(true);
    setError("");
    setData(null);

    try {
      const json = await requestJson<FipeResponse>(
        `${API_BASE}/${vehicleType}/brands/${brandId}/models/${modelId}/years/${yearId}`
      );
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao consultar veículo");
    } finally {
      setLoadingResult(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.20),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_25%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_30%)]" />

        <div className="relative mx-auto w-full max-w-[1650px] px-3 py-3 sm:px-4 lg:px-5">
            <section className="rounded-[26px] border border-white/10 bg-white/8 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="" style={{margin: '0 7vw 0 0'}}>
                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl">
                      Descubra o valor FIPE do veículo sem complicação
                    </h1>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {vehicleTypeOptions.map((option) => {
                    const active = vehicleType === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setVehicleType(option.value)}
                        className={`group rounded-2xl border p-3 text-left transition-all duration-200 ${
                          active
                            ? "border-cyan-400/60 bg-cyan-400/15 shadow-lg shadow-cyan-900/30"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-2xl p-2.5 ${
                              active
                                ? "bg-cyan-300/20 text-cyan-100"
                                : "bg-white/10 text-slate-200"
                            }`}
                          >
                            {option.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {option.label}
                            </div>
                            <div className="text-xs text-slate-400">
                              {option.subtitle}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <form
                  onSubmit={consultarFipe}
                  className="grid gap-4 rounded-[24px] border border-white/10 bg-slate-950/40 p-4 md:grid-cols-2"
                >
                  <Field label="Marca">
                    <select
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                      disabled={loadingBrands || brands.length === 0}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="" className="text-slate-900">
                        {loadingBrands
                          ? "Carregando marcas..."
                          : "Selecione uma marca"}
                      </option>
                      {brands.map((brand) => (
                        <option
                          key={brand.code}
                          value={brand.code}
                          className="text-slate-900"
                        >
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Modelo">
                    <select
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      disabled={!brandId || loadingModels || models.length === 0}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="" className="text-slate-900">
                        {!brandId
                          ? "Selecione uma marca primeiro"
                          : loadingModels
                          ? "Carregando modelos..."
                          : "Selecione um modelo"}
                      </option>
                      {models.map((model) => (
                        <option
                          key={model.code}
                          value={model.code}
                          className="text-slate-900"
                        >
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Ano / Combustível">
                    <select
                      value={yearId}
                      onChange={(e) => setYearId(e.target.value)}
                      disabled={!modelId || loadingYears || years.length === 0}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="" className="text-slate-900">
                        {!modelId
                          ? "Selecione um modelo primeiro"
                          : loadingYears
                          ? "Carregando anos..."
                          : "Selecione um ano"}
                      </option>
                      {years.map((year) => (
                        <option
                          key={year.code}
                          value={year.code}
                          className="text-slate-900"
                        >
                          {year.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={!brandId || !modelId || !yearId || loadingResult}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Search className="h-4 w-4" />
                      {loadingResult ? "Consultando..." : "Consultar valor FIPE"}
                    </button>
                  </div>
                </form>

                {error && (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
                    {error}
                  </div>
                )}
              </div>
            </section>
          

          {data && (
            <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-cyan-200">
                      Resultado da consulta
                    </div>
                    <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                      {data.brand} {data.model}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-emerald-400/15 px-4 py-3 text-right">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-200">
                      Preço FIPE
                    </div>
                    <div className="mt-1 text-2xl font-bold text-white">
                      {data.price}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Info
                    label="Marca"
                    value={data.brand}
                    icon={<Car className="h-4 w-4" />}
					style={{}}
                  />
                  <Info
                    label="Ano"
                    value={String(data.modelYear)}
                    icon={<CalendarDays className="h-4 w-4" />}
					style={{}}
                  />
				  <Info
                    label="Referência"
                    value={data.referenceMonth}
                    icon={<CalendarDays className="h-4 w-4" />}
					style={{}}
                  />
                  <Info
                    label="Combustível"
                    value={data.fuel}
                    icon={<Fuel className="h-4 w-4" />}
					style={{}}
                  />
				  <Info
                    label="Modelo"
                    value={data.model}
                    icon={<Sparkles className="h-4 w-4" />}
					style={{ width: '53vw', textAlign: 'left' }}
                  />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function Info({ label, value, destaque = false, icon, style }: InfoProps) {
  return (
    <div style={style}
      className={`rounded-2xl border p-3 shadow-lg transition ${
        destaque
          ? "border-emerald-400/20 bg-emerald-400/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <span className="rounded-xl bg-white/10 p-2 text-slate-100">
          {icon}
        </span>
        {label}
      </div>
      <div
        className={`mt-2 font-semibold ${
          destaque ? "text-2xl text-white" : "text-base text-white"
        }`}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function StepItem({
  index,
  title,
  description,
  done,
}: {
  index: string;
  title: string;
  description: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
          done ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-slate-300"
        }`}
      >
        {index}
      </div>
      <div>
        <div className="font-medium text-white">{title}</div>
        <div className="mt-1 text-sm text-slate-400">{description}</div>
      </div>
    </div>
  );
}