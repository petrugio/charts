const chartContainer = document.getElementById("chart-container");

const defaultTickers = ["NASDAQ:AAPL", "NASDAQ:GOOGL", "NASDAQ:AMZN", "NASDAQ:MSFT"];

// Get tickers from local storage or use default tickers
const getStoredTickers = () => {
  const storedTickers = localStorage.getItem("tickers");
  return storedTickers ? JSON.parse(storedTickers) : defaultTickers;
};

// Save tickers to local storage
const storeTickers = (tickers) => {
  localStorage.setItem("tickers", JSON.stringify(tickers));
};

const createChart = (symbol) => {
  const chartDiv = document.createElement("div");
  chartDiv.id = `tradingview_${symbol}`;
  chartDiv.classList.add("chart");
  chartContainer.appendChild(chartDiv);

  const chart = new TradingView.widget({
    autosize: true,
    symbol: symbol,
    interval: "D",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#f1f3f6",
    enable_publishing: false,
    allow_symbol_change: true,
    container_id: chartDiv.id,
    display_market_status: false,
    withdateranges: false,
    hide_side_toolbar: true,
    hide_legend: false,
    disabled_features: ["volume_force_overlay"],
    onSymbolChange: (symbol, chart) => {
      const tickers = getStoredTickers();
      const index = tickers.indexOf(chart._options.symbol);
      tickers[index] = symbol;
      storeTickers(tickers);
    },
  });
};

// Initialize charts
const tickers = getStoredTickers();
tickers.forEach((ticker) => createChart(ticker));
