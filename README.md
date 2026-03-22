
# 🚗 FIPE Vehicle Lookup

Aplicação web desenvolvida em **React + TypeScript** para consulta de valores da **Tabela FIPE**, permitindo selecionar tipo de veículo, marca, modelo e ano e retornando o preço de referência atualizado.

O projeto consome a **API pública da FIPE** e apresenta  os dados em uma interface moderna utilizando **TailwindCSS**.

---

## 📊 Funcionalidades

- Consulta de veículos por:
  - 🚙 Carros
  - 🏍️ Motos
  - 🚛 Caminhões
- Carregamento dinâmico de:
  - Marcas
  - Modelos
  - Anos
- Consulta do valor FIPE em tempo real
- Exibição de:
  - Marca
  - Modelo
  - Ano
  - Combustível
  - Mês de referência
  - Código FIPE
  - Valor do veículo
- Exibição do JSON retornado pela API para fins de debug
- Interface responsiva e moderna

---

## 🖥️ Tecnologias utilizadas

- React
- TypeScript
- Vite
- TailwindCSS
- Lucide React (ícones)
- API FIPE

---

## 🌐 API utilizada

API pública de consulta da tabela FIPE:

```
https://parallelum.com.br/fipe/api/v2
```

### Endpoint principal utilizado

```
/{vehicleType}/brands/{brandId}/models/{modelId}/years/{yearId}
```

### Exemplo de requisição

```
https://parallelum.com.br/fipe/api/v2/cars/brands/59/models/5940/years/2014-1
```

### Exemplo de resposta

```json
{
  "brand": "VW - VolksWagen",
  "model": "Gol 1.0",
  "modelYear": 2014,
  "fuel": "Gasolina",
  "price": "R$ 29.000,00",
  "fipeCode": "005340-6",
  "referenceMonth": "março de 2026"
}
```

---

## 📦 Instalação

Clone o repositório:

```bash
git clone https://github.com/joaodagostin/fipe-react.git
```

Entre na pasta do projeto:

```bash
cd fipe-react
```

Instale as dependências:

```bash
npm install
```

---

## ▶️ Executar o projeto

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O projeto ficará disponível em:

```
http://localhost:5173
```

---

## 📁 Estrutura do projeto

```
src/
 ├── App.tsx
 ├── main.tsx
 ├── index.css
 └── components
```

### Responsabilidades

| Arquivo | Função |
|--------|--------|
| App.tsx | Lógica principal da aplicação |
| main.tsx | Inicialização do React |
| index.css | Estilos globais |
| components | Componentes reutilizáveis |

---

## 🔄 Fluxo da aplicação

1. Usuário seleciona o **tipo de veículo**
2. A aplicação carrega as **marcas disponíveis**
3. Após selecionar a marca, carrega os **modelos**
4. Após selecionar o modelo, carrega os **anos**
5. Usuário clica em **Consultar**
6. A aplicação consulta o endpoint final da API e exibe o resultado

---

## 📚 Possíveis melhorias

- Histórico de consultas
- Exibir imagem real do veículo
- Cache de consultas
- Melhor responsividade mobile
- Deploy em cloud
- Integração com APIs automotivas mais completas

---

## 👨‍💻 Autor

**João Gabriel Rosso Dagostin**

GitHub:  
https://github.com/joaodagostin

---

## 📄 Licença

Projeto desenvolvido para fins educacionais.
