//import {API_KEY} from "/config2.js";

console.log("[Content] this is content script")

// Function to retrieve live exchange rates from the API and cache them

async function fetchAndCacheRates() {
    try {
        const url = `https://apilayer.net/api/live?access_key=2ba7d59224fbc76168b363c9ac91fe82`;
        const response = await fetch(url);
        if (!response) { 
            throw new Error("Failed to fetch data");
        }
        // only get the quotes
        const data = await response.json();
        // store the conversion rates with the timestamp of retrieval in milliseconds
        const entry = {
            data: data.quotes,
            timestamp: Date.now()
        }
        // use chrome.storage.local to store the data, it automatically serializes the data
        await chrome.storage.local.set({exchangeRates: entry});
        return data; 
    } catch (error) {
        console.log("CANT FETCH DATA");
        return null;
    }
}

// Function to convert currency from a given amount, fromCurrency to toCurrency

async function convertCurrency(amount, fromCurrency, toCurrency) {
    const rates = await retrieveCache();
    let conversionRate; 
    if (fromCurrency === "USD") {
        conversionRate = rates[`USD${toCurrency}`]; 
    } else {
        if (toCurrency === "USD") {
            conversionRate = 1 / rates[`USD${fromCurrency}`]; 
        } else {
            conversionRate =  rates[`USD${toCurrency}`] / rates[`USD${fromCurrency}`]; 
        }
    }
    return amount * conversionRate; 
}

// Function to retrieve cached data or make a new fetch if expired or not there 

async function retrieveCache() {
    return new Promise((resolve, reject) => {
        // try to retrieve the data from the cache
        chrome.storage.local.get(['exchangeRates'], function(output) {
            console.log("CHeckpoint1");
            // if chrome error, reject the promise
            if (chrome.runtime.lastError) {
                console.log("CHeckpoint2");
                reject(chrome.runtime.lastError);
                return; 
            } 
            // try to fetch data from the API
            const response = output.exchangeRates; 
            // if nothing there, fetch and cache data 
            if (!response.data) {
                console.log("No data found, doing initial API call...");
                resolve(fetchAndCacheRates());
                return; 
            }
            // else, check if its expired
            const now = Date.now();
            const timestamp = response.timestamp;
            console.log("CHeckpoint3");
            if (now - timestamp > 28800000) {
                console.log("CHeckpoint4");
                // remove the old data, clean up step, if older than 8 hours
                console.log("Data expired, doing another API call..."); 
                chrome.storage.local.remove('exchangeRates', function() { 
                    // check for error again
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return; 
                    } 
                    // fetch and cache new data
                    resolve(fetchAndCacheRates());
                })
            } else {
                // else, return the data 
                resolve(response.data);
            }
    })}); 
}

async function extractCurrencyAndAmount(text) {
    // Extract 3 letter currency symbol 
    const currencyRegex = /[A-Z]{3}/;
    // Extract the amount
    const amountRegex = /[\d,]+\.?\d*/;

    const currency = text.match(currencyRegex);
    const amount = text.match(amountRegex);

    let number = null;
    if (amount) {
        number = parseFloat(amount[0].replace(/,/g, ''));
    }

    return {
        currency: currency ? currency[0] : null,
        number: number ? number : null 
    };
}

function createPopup(selectionText, position) {
    var popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = (position.top - 50) + "px"; // position it above the selection
    popup.style.left = (position.left) + "px"; // align it with the left side of the selection
    popup.style.backgroundColor = "#fff";
    popup.style.border = "1px solid #000";
    popup.style.padding = "10px";
    
    // Create a Popup div
    var selected = document.createElement("div");
    selected.textContent = selectionText;
    popup.appendChild(selected);
    
    popup.id = "myPopup";

    return popup;
}

document.addEventListener("mouseup", async (event) => {
    var selection = window.getSelection();
    var selectionText = selection.toString().trim();
    console.log("[Content] selection: " + selection);
    if (selectionText && selectionText !== "") {
      var rect = selection.getRangeAt(0).getBoundingClientRect();
      try {
        const selectedCurr = await extractCurrencyAndAmount(selectionText); 
        const result = await convertCurrency(selectedCurr.number, selectedCurr.currency, "USD");
        const popup = createPopup(result, rect);
        document.body.appendChild(popup);
        document.addEventListener("mousedown", function(event) {
          var isClickInside = popup.contains(event.target);
          if (!isClickInside) {
              popup.parentNode.removeChild(popup);
              document.removeEventListener("mousedown", arguments.callee);
          }
        });
      } catch(error) {
        throw(error);
      }
    }
  });
  


