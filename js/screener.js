document.addEventListener("DOMContentLoaded", function () {
    const chartingIframe = document.getElementById("tradingview_de558");
  
    // Listen for messages from the screener widget
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "symbolSelected") {
        const selectedSymbol = encodeURIComponent(event.data.symbol);
        const chartUrl = `https://petrugio.github.io/charts/screener.html?tvwidgetsymbol=${selectedSymbol}`;
        
        // Update the iframe's src with the selected symbol
        chartingIframe.src = chartUrl;
      }
    });
  });
  