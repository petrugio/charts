const chartContainer = document.getElementById("chart-container");

const getDefaultSettings = () => {
  return {
    timezone: "Etc/UTC",
    barType: "1",
    showDetails: true,
    showBottomToolbar: true,
    hideTopToolbar: false,
    hideLegend: false,
    hideSideToolbar: false,
    // useSmallButtons: false,
    useDarkMode: true,
  };
};

const getGlobalSettings = () => {
  const settings = localStorage.getItem("globalSettings");
  return settings ? JSON.parse(settings) : getDefaultSettings();
};

const setGlobalSettings = (newSettings) => {
  localStorage.setItem("globalSettings", JSON.stringify(newSettings));
};

document.addEventListener("DOMContentLoaded", () => {
  const addChartButton = document.getElementById("add-chart");
  const directInput = document.getElementById("direct-input");
  const addDirectButton = document.getElementById("add-direct");

  const apiKey = "182BEAGEPNBL8AAS";

  const defaultTickers = ["CME_MINI:ES1!", "CME_MINI:NQ1!", "CME_MINI:6E1!", "AMEX:TIP", "FRED:WALCL+FRED:JPNASSETS*FX_IDC:JPYUSD+ECONOMICS:CNCBBS*FX_IDC:CNYUSD+FRED:ECBASSETSW*FX:EURUSD-FRED:RRPONTSYD-FRED:WTREGEN"];

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

      const settings = getGlobalSettings();

      const chart = new TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: "D",
        timezone: settings.timezone,
        theme: settings.useDarkMode ? "dark" : "light",
        style: settings.barType,
        details: settings.showDetails,
        withdateranges: settings.showBottomToolbar,
        hide_top_toolbar: settings.hideTopToolbar,
        hide_legend: settings.hideLegend,
        hide_side_toolbar: settings.hideSideToolbar,
        // toolbar: settings.useSmallButtons ? "small" : "large",
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: chartDiv.id,
        // display_market_status: false,
        // withdateranges: false,
        // hide_side_toolbar: true,
        // hide_legend: false,
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
  
  const settings = getGlobalSettings();

  // Set the initial values for the checkboxes and other form elements
  document.getElementById("timezone-select").value = settings.timezone;
  document.getElementById("bar-type-select").value = settings.barType;
  document.getElementById("show-details").checked = settings.showDetails;
  document.getElementById("show-bottom-toolbar").checked = settings.showBottomToolbar;
  document.getElementById("hide-top-toolbar").checked = settings.hideTopToolbar;
  document.getElementById("hide-legend").checked = settings.hideLegend;
  document.getElementById("hide-side-toolbar").checked = settings.hideSideToolbar;
  // document.getElementById("use-small-buttons").checked = settings.useSmallButtons;
  document.getElementById("use-dark-mode").checked = settings.useDarkMode;
  const settingsDoneButton = document.getElementById("settings-done");

  settingsDoneButton.addEventListener("click", () => {
    const updatedSettings = {
    timezone: document.getElementById("timezone-select").value,
    barType: document.getElementById("bar-type-select").value,
    showDetails: document.getElementById("show-details").checked,
    showBottomToolbar: document.getElementById("show-bottom-toolbar").checked,
    hideTopToolbar: document.getElementById("hide-top-toolbar").checked,
    hideLegend: document.getElementById("hide-legend").checked,
    hideSideToolbar: document.getElementById("hide-side-toolbar").checked,
    // useSmallButtons: document.getElementById("use-small-buttons").checked,
    useDarkMode: document.getElementById("use-dark-mode").checked,
    };

    setGlobalSettings(updatedSettings);
    location.reload();
  });
});

const heightInput = document.getElementById("height-input");
const widthInput = document.getElementById("width-input");

const updateChartLayout = () => {
  const height = parseInt(heightInput.value);
  const width = parseInt(widthInput.value);

  chartContainer.style.gridTemplateRows = `repeat(${height}, 1fr)`;
  chartContainer.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
};

// Update the chart layout when the height or width input values change
heightInput.addEventListener("input", updateChartLayout);
widthInput.addEventListener("input", updateChartLayout);

// Initialize the chart layout based on the initial input values
updateChartLayout();

const settingsButton = document.getElementById("settings-button");
const settingsModal = document.getElementById("settings-modal");
const settingsDone = document.getElementById("settings-done");
const settingsCancel = document.getElementById("settings-cancel");

settingsButton.addEventListener("click", () => {
  settingsModal.style.display = "block";
});

settingsDone.addEventListener("click", () => {
  settingsModal.style.display = "none";
  // Apply changes to the charts here
});

settingsCancel.addEventListener("click", () => {
  settingsModal.style.display = "none";
  // Revert changes if necessary
});





 

