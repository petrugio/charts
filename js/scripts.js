
const chartContainer = document.getElementById("chart-container");

const loadSettingsToForm = () => {
	const settings = getGlobalSettings();
	document.getElementById("timezone-select").value = settings.timezone;
	document.getElementById("bar-type-select").value = settings.barType;
	document.getElementById("show-details").checked = settings.showDetails;
	document.getElementById("show-bottom-toolbar").checked = settings.showBottomToolbar;
	document.getElementById("hide-top-toolbar").checked = settings.hideTopToolbar;
	document.getElementById("hide-legend").checked = settings.hideLegend;
	document.getElementById("hide-side-toolbar").checked = settings.hideSideToolbar;
	document.getElementById("use-dark-mode").checked = settings.useDarkMode;
	document.getElementById("timeframe-select").value = settings.timeframe;
	document.getElementById("hide-volume").checked = settings.hideVolume;

};

const getDefaultSettings = () => {
	return {
		timezone: "Etc/UTC",
		timeframe: "D",
		barType: "1",
		showDetails: false,
		showBottomToolbar: false,
		hideTopToolbar: false,
		hideLegend: true,
		hideSideToolbar: true,
		useDarkMode: false,
		hideVolume: false,
		blackWhiteCandles: true,
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

	loadSettingsToForm();

	const apiKey = "182BEAGEPNBL8AAS";

	const defaultTickers = [
		"INDEX:BTCUSD",
		"INDEX:ETHUSD",
		"CRYPTOCAP:BTC.D",
		"OANDA:SPX500USD",
		"OANDA:NAS100USD",
		"OANDA:EU50EUR",
		"CURRENCYCOM:CN50",
		"CAPITALCOM:GOLD",
		"KRX:KOSPI",
		"PEPPERSTONE:VIX",
		"AMEX:TIP",
		"FRED:WALCL+FRED:JPNASSETS*FX_IDC:JPYUSD+ECONOMICS:CNCBBS*FX_IDC:CNYUSD+FRED:ECBASSETSW*FX:EURUSD-FRED:RRPONTSYD-FRED:WTREGEN"]
	;

	const getStoredTickers = () => {
		const storedTickers = localStorage.getItem("tickers");
		return storedTickers ? JSON.parse(storedTickers) : defaultTickers;
	};

	const storeTickers = (tickers) => {
		localStorage.setItem("tickers", JSON.stringify(tickers));
	};

	const createChart = (symbol, selectedIndicators = []) => {
		return new Promise((resolve) => {
			const chartDiv = document.createElement("div");
			chartDiv.id = `tradingview_${symbol}`;
			chartDiv.classList.add("chart");
			chartContainer.appendChild(chartDiv);

			const settings = getGlobalSettings();
			const studies = selectedIndicators.map((indicator) => indicator.value);

			const chart = new TradingView.widget({
				autosize: true,
				symbol: symbol,
				interval: settings.timeframe,
				timezone: settings.timezone,
				theme: settings.useDarkMode ? "dark" : "light",
				style: settings.barType,
				details: settings.showDetails,
				withdateranges: settings.showBottomToolbar,
				hide_top_toolbar: settings.hideTopToolbar,
				hide_legend: settings.hideLegend,
				hide_side_toolbar: settings.hideSideToolbar,
				locale: "en",
				toolbar_bg: "#f1f3f6",
				enable_publishing: false,
				allow_symbol_change: true,
				container_id: chartDiv.id,
				disabled_features: ["volume_force_overlay"],
				hide_volume: settings.hideVolume ? 0 : 1,
				studies: studies,
				onSymbolChange: (symbol, chart) => {
					const tickers = getStoredTickers();
					const index = tickers.indexOf(chart._options.symbol);
					tickers[index] = symbol;
					storeTickers(tickers);
				},
				"overrides": settings.blackWhiteCandles ? {
					"mainSeriesProperties.candleStyle.upColor": "#FFFFFF",
					"mainSeriesProperties.candleStyle.downColor": "#000000",
					"mainSeriesProperties.candleStyle.borderUpColor": "#000000",
					"mainSeriesProperties.candleStyle.borderDownColor": "#000000",
					"mainSeriesProperties.candleStyle.wickUpColor": "#000000",
					"mainSeriesProperties.candleStyle.wickDownColor": "#000000"
				} : {},
				"onReady": function() {
					if (settings.blackWhiteCandles) {
						this.applyOverrides({
							"mainSeriesProperties.candleStyle.upColor": "#FFFFFF",
							"mainSeriesProperties.candleStyle.downColor": "#000000",
							"mainSeriesProperties.candleStyle.borderUpColor": "#000000",
							"mainSeriesProperties.candleStyle.borderDownColor": "#000000",
							"mainSeriesProperties.candleStyle.wickUpColor": "#000000",
							"mainSeriesProperties.candleStyle.wickDownColor": "#000000"
						});
					}
					resolve(this); // Resolve the Promise with the chart instance
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
		});
	};

	function addStudiesToChart(chart, studies) {
		studies.forEach((study) => {
			chart.createStudy(study, false, false);
		});
	}


	// Indicators
    /////////////////////////////////////////////////////////////////////////////////////////////////

	// Initialize selected indicators
	let selectedIndicators = [];

	// Show the indicators modal
	function showIndicatorsModal() {
		document.getElementById("indicators-modal").style.display = "block";
	}

	// Hide the indicators modal
	function hideIndicatorsModal() {
		document.getElementById("indicators-modal").style.display = "none";
	}

	async function applySelectedIndicators() {
		// Remove all existing chart elements
		const chartContainer = document.getElementById("chart-container");
		while (chartContainer.firstChild) {
			chartContainer.removeChild(chartContainer.firstChild);
		}

		// Get the selected indicators from the checkboxes
		selectedIndicators = indicators.filter((indicator) => indicator.checked);
		setSelectedIndicators(selectedIndicators);

		// Re-create chart instances with the updated indicators
		const tickers = getStoredTickers();
		const chartPromises = tickers.map((ticker) =>
			createChart(ticker, selectedIndicators)
		);
		const charts = await Promise.all(chartPromises);

		// Add the studies to the created charts
		charts.forEach((chart) => {
			addStudiesToChart(chart, studies);
		});

		hideIndicatorsModal();
	}

	function createIndicatorCheckboxes() {
		const indicatorsContainer = document.getElementById("indicators-container");
		const savedSelectedIndicators = getSelectedIndicators();

		indicators.forEach((indicator) => {
			// Check if the indicator is in the saved selected indicators
			indicator.checked = savedSelectedIndicators.some(
				(savedIndicator) => savedIndicator.value === indicator.value
			);

			const listItem = document.createElement("li");

			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.id = indicator.value;
			checkbox.checked = indicator.checked || false; // Load the checked state from the indicators array

			const label = document.createElement("label");
			label.htmlFor = indicator.value;
			label.textContent = indicator.name;

			listItem.appendChild(checkbox);
			listItem.appendChild(label);
			indicatorsContainer.appendChild(listItem);

			checkbox.addEventListener("change", () => {
				indicator.checked = checkbox.checked; // Update the checked state in the indicators array
			});
		});
	}

	const getSelectedIndicators = () => {
		const selectedIndicators = localStorage.getItem("selectedIndicators");
		return selectedIndicators ? JSON.parse(selectedIndicators) : [];
	};

	const setSelectedIndicators = (indicators) => {
		localStorage.setItem("selectedIndicators", JSON.stringify(indicators));
	};


	// Event listeners
	document.getElementById("indicators-button").addEventListener("click", showIndicatorsModal);
	document.getElementById("indicators-cancel").addEventListener("click", () => {
		hideIndicatorsModal();
		location.reload();
	});
	document.getElementById("indicators-done").addEventListener("click", () => {
		applySelectedIndicators();
		hideIndicatorsModal();
	});

	createIndicatorCheckboxes();

	const tickers = getStoredTickers();
	const savedSelectedIndicators = getSelectedIndicators();
	tickers.forEach((ticker) => createChart(ticker, savedSelectedIndicators));


	// Add Chart Modal
	/////////////////////////////////////////////////////////////////////////////////////////////////
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
	document.getElementById("use-dark-mode").checked = settings.useDarkMode;
	const settingsDoneButton = document.getElementById("settings-done");
	document.getElementById("bw-checkbox").checked = settings.blackWhiteCandles;

	settingsDoneButton.addEventListener("click", () => {
		const updatedSettings = {
			timezone: document.getElementById("timezone-select").value,
			barType: document.getElementById("bar-type-select").value,
			showDetails: document.getElementById("show-details").checked,
			showBottomToolbar: document.getElementById("show-bottom-toolbar").checked,
			hideTopToolbar: document.getElementById("hide-top-toolbar").checked,
			hideLegend: document.getElementById("hide-legend").checked,
			hideSideToolbar: document.getElementById("hide-side-toolbar").checked,
			useDarkMode: document.getElementById("use-dark-mode").checked,
			timeframe: document.getElementById("timeframe-select").value,
			hideVolume: document.getElementById("hide-volume").checked,
			blackWhiteCandles: document.getElementById("bw-checkbox").checked,
		};

		setGlobalSettings(updatedSettings);
		location.reload();
	});

	// Define the height and width inputs
	const heightInput = document.getElementById("height-input");
	const widthInput = document.getElementById("width-input");

	// Get the stored values for height and width
	const storedHeight = localStorage.getItem("height");
	const storedWidth = localStorage.getItem("width");

	// Set the initial height and width values to the stored values or defaults
	const defaultHeight = 3;
	const defaultWidth = 4;

	const initialHeight = storedHeight ? parseInt(storedHeight) : defaultHeight;
	const initialWidth = storedWidth ? parseInt(storedWidth) : defaultWidth;

	// Set the height and width input values to the initial values
	heightInput.value = initialHeight;
	widthInput.value = initialWidth;

	// Update the chart layout based on the height and width input values
	const updateChartLayout = () => {
		const height = parseInt(heightInput.value);
		const width = parseInt(widthInput.value);

		chartContainer.style.gridTemplateRows = `repeat(${height}, 1fr)`;
		chartContainer.style.gridTemplateColumns = `repeat(${width}, 1fr)`;

		// Store the new height and width values in the browser
		localStorage.setItem("height", height);
		localStorage.setItem("width", width);
	};

	// Add event listeners to update the chart layout when the height or width input values change
	heightInput.addEventListener("input", updateChartLayout);
	widthInput.addEventListener("input", updateChartLayout);

	// Initialize the chart layout based on the initial input values
	updateChartLayout();

	const settingsButton = document.getElementById("settings-button");
	const settingsModal = document.getElementById("settings-modal");
	const settingsCancel = document.getElementById("settings-cancel");
	const settingsReset = document.getElementById("settings-reset");
	const resetLayoutButton = document.getElementById("reset-layout");

	let initialSettings = null;
	settingsButton.addEventListener("click", () => {
		initialSettings = getGlobalSettings(); // Store the initial settings
		loadSettingsToForm(initialSettings);
		settingsModal.style.display = "block";
	});

	settingsReset.addEventListener("click", () => {
		// Reset settings to default values and reload the page
		setGlobalSettings(getDefaultSettings());
		location.reload();
	});

	settingsCancel.addEventListener("click", () => {
		settingsModal.style.display = "none";
		// Restore the initial settings and reload the page
		setGlobalSettings(initialSettings);
		location.reload();
	});

	resetLayoutButton.addEventListener("click", () => {
		storeTickers(defaultTickers);
		localStorage.setItem("height", defaultHeight);
		localStorage.setItem("width", defaultWidth);
		location.reload();
	});

	const timezoneOptions = [
		"Etc/UTC",
		"Etc/GMT+12",
		"Etc/GMT+11",
		"Etc/GMT+10",
		"Etc/GMT+9",
		"Etc/GMT+8",
		"Etc/GMT+7",
		"Etc/GMT+6",
		"Etc/GMT+5",
		"Etc/GMT+4",
		"Etc/GMT+3",
		"Etc/GMT+2",
		"Etc/GMT+1",
		"Etc/GMT-1",
		"Etc/GMT-2",
		"Etc/GMT-3",
		"Etc/GMT-4",
		"Etc/GMT-5",
		"Etc/GMT-6",
		"Etc/GMT-7",
		"Etc/GMT-8",
		"Etc/GMT-9",
		"Etc/GMT-10",
		"Etc/GMT-11",
		"Etc/GMT-12",
		"Etc/GMT-13",
		"Etc/GMT-14",
	];

	const barTypeOptions = [{
			value: "0",
			text: "Bars"
		},
		{
			value: "1",
			text: "Candles"
		},
		{
			value: "9",
			text: "Hollow Candles"
		},
		{
			value: "8",
			text: "Heikin Ashi"
		},
		{
			value: "2",
			text: "Line"
		},
		{
			value: "3",
			text: "Area"
		},
		{
			value: "5",
			text: "Kagi"
		},
		{
			value: "4",
			text: "Renko"
		},
		{
			value: "7",
			text: "Line Break"
		},
		{
			value: "6",
			text: "Point & Figure"
		}
	];

	const timezoneSelect = document.getElementById("timezone-select");
	const barTypeSelect = document.getElementById("bar-type-select");

	timezoneOptions.forEach((timezone) => {
		const option = document.createElement("option");
		option.value = timezone;
		option.text = timezone;
		timezoneSelect.appendChild(option);
	});

	barTypeOptions.forEach((barType) => {
		const option = document.createElement("option");
		option.value = barType.value;
		option.text = barType.text;
		barTypeSelect.appendChild(option);
	});

	const timeframes = [
		{ value: "1", text: "1 minute" },
		{ value: "5", text: "5 minutes" },
		{ value: "15", text: "15 minutes" },
		{ value: "30", text: "30 minutes" },
		{ value: "60", text: "1 hour" },
		{ value: "240", text: "4 hour" },
		{ value: "D", text: "1 day" },
		{ value: "W", text: "1 week" },
		{ value: "M", text: "1 month" },
	  ];

	const timeframeSelect = document.getElementById("timeframe-select");

		timeframes.forEach((timeframe) => {
		const option = document.createElement("option");
		option.value = timeframe.value;
		option.text = timeframe.text;
		timeframeSelect.appendChild(option);
	});

});


// Responsive menu button
/////////////////////////////////////////////////////////////////////////////////////////////////

const navItems = document.querySelector(".nav-items");
const logoText = document.querySelector(".logo-text");

logoText.addEventListener("click", () => {
  navItems.classList.toggle("show");
});







