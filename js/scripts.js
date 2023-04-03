
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
		blackWhiteCandles: false,
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

	const defaultTickers = ["CME_MINI:ES1!", "CME_MINI:NQ1!", "CME:6E1!", "AMEX:TIP", "FRED:WALCL+FRED:JPNASSETS*FX_IDC:JPYUSD+ECONOMICS:CNCBBS*FX_IDC:CNYUSD+FRED:ECBASSETSW*FX:EURUSD-FRED:RRPONTSYD-FRED:WTREGEN"];

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

			console.log("studies:", studies);
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
				hidevolume: settings.hideVolume ? 0 : 1,
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


	const tickers = getStoredTickers();
	tickers.forEach((ticker) => createChart(ticker, []));

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
		indicators.forEach((indicator) => {
			const listItem = document.createElement("li");

			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.id = indicator.value;
			checkbox.checked = indicator.checked || false; // Save the checked state

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

	const indicators = [
		{ name: 'Accumulation Distribution', value: 'ACCD@tv-basicstudies' },
		{ name: 'Advance Decline Ratio Bars', value: 'studyADR@tv-basicstudies' },
		{ name: 'Anchored VWAP', value: 'AnchoredVWAP@tv-basicstudies' },
		{ name: 'Aroon', value: 'AROON@tv-basicstudies' },
		{ name: 'Average True Range', value: 'ATR@tv-basicstudies' },
		{ name: 'Awesome Oscillator', value: 'AwesomeOscillator@tv-basicstudies' },
		{ name: 'Bollinger Bands', value: 'BB@tv-basicstudies' },
		{ name: 'Bollinger Bands B', value: 'BollingerBandsR@tv-basicstudies' },
		{ name: 'Bollinger Bands Width', value: 'BollingerBandsWidth@tv-basicstudies' },
		{ name: 'CCI', value: 'CCI@tv-basicstudies' },
		{ name: 'Chaikin Money Flow', value: 'CMF@tv-basicstudies' },
		{ name: 'Chaikin Oscillator', value: 'ChaikinOscillator@tv-basicstudies' },
		{ name: 'Chande Momentum Oscillator', value: 'chandeMO@tv-basicstudies' },
		{ name: 'Choppiness Index', value: 'ChoppinessIndex@tv-basicstudies' },
		{ name: 'Connors RSI', value: 'CRSI@tv-basicstudies' },
		{ name: 'DEMA', value: 'DoubleEMA@tv-basicstudies' },
		{ name: 'DMI', value: 'DM@tv-basicstudies' },
		{ name: 'Donchian Channels', value: 'DONCH@tv-basicstudies' },
		{ name: 'DPO', value: 'DetrendedPriceOscillator@tv-basicstudies' },
		{ name: 'Ease Of Movement', value: 'EaseOfMovement@tv-basicstudies' },
		{ name: 'EMA', value: 'MAExp@tv-basicstudies' },
		{ name: 'ENV', value: 'ENV@tv-basicstudies' },
		{ name: 'EFI', value: 'EFI@tv-basicstudies' },
		{ name: 'Fisher Transform', value: 'FisherTransform@tv-basicstudies' },
		{ name: 'Historical Volatility', value: 'HV@tv-basicstudies' },
		{ name: 'Hull MA', value: 'hullMA@tv-basicstudies' },
		{ name: 'Ichimoku Cloud', value: 'IchimokuCloud@tv-basicstudies' },
		{ name: 'Keltner Channels', value: 'KLTNR@tv-basicstudies' },
		{ name: 'MACD', value: 'MACD@tv-basicstudies' },
		{ name: 'Momentum', value: 'MOM@tv-basicstudies' },
		{ name: 'Money Flow', value: 'MF@tv-basicstudies' },
		{ name: 'OBV', value: 'On_Balance_Volume@tv-basicstudies' },
		{ name: 'PSAR', value: 'PSAR@tv-basicstudies' },
		{ name: 'Price Oscillator', value: 'PriceOsc@tv-basicstudies' },
		{ name: 'Price Oscillator', value: 'PriceOsc@tv-basicstudies' },
		{ name: 'Price Volume Trend', value: 'PriceVolumeTrend@tv-basicstudies' },
		{ name: 'Pivot Points HighLow', value: 'PivotPointsHighLow@tv-basicstudies' },
		{ name: 'Pivot Points Standard', value: 'PivotPointsStandard@tv-basicstudies' },
		{ name: 'Relative Vigor Index', value: 'VigorIndex@tv-basicstudies' },
		{ name: 'Relative Volatility Index', value: 'VolatilityIndex@tv-basicstudies' },
		{ name: 'ROC', value: 'ROC@tv-basicstudies' },
		{ name: 'RSI', value: 'RSI@tv-basicstudies' },
		{ name: 'SMI Ergodic Indicator Oscillator', value: 'SMIErgodicIndicator@tv-basicstudies' },
		{ name: 'SMI Ergodic Oscillator', value: 'SMIErgodicOscillator@tv-basicstudies' },
		{ name: 'SMA', value: 'MASimple@tv-basicstudies' },
		{ name: 'Stochastic', value: 'Stochastic@tv-basicstudies' },
		{ name: 'Stochastic RSI', value: 'StochasticRSI@tv-basicstudies' },
		{ name: 'TEMA', value: 'TripleEMA@tv-basicstudies' },
		{ name: 'TRIX', value: 'Trix@tv-basicstudies' },
		{ name: 'Ultimate Oscillator', value: 'UltimateOsc@tv-basicstudies' },
		{ name: 'VWMA', value: 'MAVolumeWeighted@tv-basicstudies' },
		{ name: 'Williams Alligator', value: 'WilliamsAlligator@tv-basicstudies' },
		{ name: 'Williams Fractals', value: 'WilliamsFractal@tv-basicstudies' },
		{ name: 'Williams R', value: 'WilliamR@tv-basicstudies' },
		{ name: 'WMA', value: 'MAWeighted@tv-basicstudies' }

	];


	createIndicatorCheckboxes();


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
	const initialHeight = storedHeight ? parseInt(storedHeight) : 2;
	const initialWidth = storedWidth ? parseInt(storedWidth) : 4;

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







