export function normalizePlate(plate) {
  return plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}