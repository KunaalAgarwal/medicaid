const baseUrl = 'https://data.medicaid.gov/api/1/';
import localforage from 'https://cdn.skypack.dev/localforage';
let updateCount = 0;

async function getItems(endpoint, downloadFlag = false) {
    try{
        updateCache();
        const timeStamp = Date.now();
        const cachedData = await localforage.getItem(endpoint);
        if (cachedData !== null) {
            localStorage.setItem(endpoint, timeStamp);
            return cachedData
        }
        const response = await fetch(baseUrl + endpoint);
        if (response.ok){
            let responseData;
            if (downloadFlag){
                responseData = await response.blob();
            } else {
                responseData = await response.json();
            }
            localforage.setItem(endpoint, responseData);
            localStorage.setItem(endpoint, timeStamp);
            return responseData
        }
    } catch (error){
        console.log("An error occurred in the API request.")
    }
}

async function postItem(endpoint, payload, headerContent, downloadFlag = false) {
    const options = {
        method: 'POST',
        headers: headerContent,
        body: JSON.stringify(payload)
    };
    try {
        updateCache();
        const timeStamp = Date.now();
        const cachedData = await localforage.getItem(options.body);
        if (cachedData !== null){
            localStorage.setItem(options.body, timeStamp);
            return cachedData;
        }

        const response = await fetch(baseUrl + endpoint, options);
        if (response.ok){
            let responseData;
            if (downloadFlag){
                responseData = await response.blob();
            } else {
                responseData = await response.json();
            }
            localforage.setItem(options.body, responseData);
            localStorage.setItem(options.body, timeStamp);
            return responseData;
        }
    } catch (error) {
        console.log("An error occurred in the API post");
    }
}

function updateCache() {
    try {
        if (updateCount < 10000) {
            updateCount++;
            return;
        }
        const timeStamp = Date.now();
        Object.keys(localStorage).forEach(key => {
            const value = Number.parseInt(localStorage.getItem(key));
            if (timeStamp - value > 86400000 * 30) { // 24 hours in ms * 30 = 1 month
                const dataKey = key.split("time")[0];
                localStorage.removeItem(key);
                localforage.removeItem(dataKey);
            }
        });
        updateCount = 0;
    } catch (error) {
        console.log("The cache could not be updated");
    }
}

function clearCache(){
    localforage.clear();
    localStorage.clear();
}

export{
    getItems,
    postItem,
    clearCache,
    updateCache
}
