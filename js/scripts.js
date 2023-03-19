document.addEventListener("DOMContentLoaded", () => {
  const chartContainer = document.getElementById("chart-container");
  const addChartButton = document.getElementById("add-chart");
   const directInput = document.getElementById("direct-input");
  const addDirectButton = document.getElementById("add-direct");

  const apiKey = "182BEAGEPNBL8AAS";

  const defaultTickers = ["NASDAQ:AAPL", "NASDAQ:GOOGL", "NASDAQ:AMZN", "NASDAQ:MSFT"];

  const getStoredTickers = () => {
    const storedTickers = localStorage.getItem("tickers");
    return storedTickers ? JSON.parse(storedTickers) : defaultTickers;
  };

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

    // Create the "x" button and add it to the chart div
    const closeButton = document.createElement("button");
    closeButton.classList.add("close-chart");
    closeButton.textContent = "x";
    closeButton.onclick = () => {
      const tickers = getStoredTickers();
      const index = tickers.indexOf(symbol);
      if (index !== -1) {
        tickers.splice(index, 1);
        storeTickers(tickers);
      }
      chartContainer.removeChild(chartDiv);
    };
    chartDiv.appendChild(closeButton);
  };

  const tickers = getStoredTickers();
  tickers.forEach((ticker) => createChart(ticker));

  // Add Chart Modal
  const addChartModal = document.getElementById("add-chart-modal");
  const closeModal = document.getElementById("close-modal");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  // Show Add Chart Modal
  addChartButton.addEventListener("click", () => {
    addChartModal.style.display = "block";
  });

  // Close Add Chart Modal
  closeModal.addEventListener("click", () => {
    addChartModal.style.display = "none";
  });

  const searchBoxContainer = document.getElementById("search-box-container");

  const searchSymbols = async (query) => {
    const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${apiKey}`);
    const data = await response.json();
    return data.bestMatches;
  };

  searchInput.addEventListener("input", async (event) => {
    const query = event.target.value;
    if (query.length > 1) {
      const symbols = await searchSymbols(query);
      searchResults.innerHTML = "";
      symbols.forEach((symbol) => {
        const result = document.createElement("div");
        result.textContent = `${symbol['2. name']} (${symbol['1. symbol']})`;
        result.classList.add("search-result");
        result.addEventListener("click", () => {
          createChart(symbol['1. symbol']);
          const tickers = getStoredTickers();
          tickers.push(symbol['1. symbol']);
          storeTickers(tickers);
          addChartModal.style.display = "none";
        });
        searchResults.appendChild(result);
      });
    } else {
      searchResults.innerHTML = "";
    }
  });
  
  addDirectButton.addEventListener("click", () => {
    const symbol = directInput.value;
    if (symbol) {
      createChart(symbol);
      const tickers = getStoredTickers();
      tickers.push(symbol);
      storeTickers(tickers);
      addChartModal.style.display = "none";
    }
  });
});