const baseUrl = 'https://data.medicaid.gov/api/1/';
import localforage from 'https://cdn.skypack.dev/localforage';
let updateCount = 0;
const dbName = "localforage"
let endpointStore = localforage.createInstance({
    name: dbName,
    storeName: "endpointStore"
})
let timeStore = localforage.createInstance({
    name: dbName,
    storeName: "timeStore"
})

async function getItems(endpoint, downloadFlag = false) {
    try{
        updateCache();
        const timeStamp = Date.now();
        const cachedData = await endpointStore.getItem(endpoint);
        if (cachedData !== null) {
            timeStore.setItem(endpoint, timeStamp);
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
            endpointStore.setItem(endpoint, responseData);
            timeStore.setItem(endpoint, timeStamp);
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
        const cachedData = await endpointStore.getItem(options.body);
        if (cachedData !== null){
            timeStore.setItem(options.body, timeStamp);
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
            endpointStore.setItem(options.body, responseData);
            timeStore.setItem(options.body, timeStamp);
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
        timeStore.keys().forEach(key => {
            const value = Number.parseInt(timeStore.getItem(key));
            if (timeStamp - value > 86400000 * 30) { // 24 hours in ms * 30 = 1 month
                const dataKey = key.split("time")[0];
                timeStore.removeItem(key);
                endpointStore.removeItem(dataKey);
            }
        });
        updateCount = 0;
    } catch (error) {
        console.log("The cache could not be updated");
    }
}

function clearCache(){
    endpointStore.clear();
    timeStore.clear();
}

export{
    getItems,
    postItem,
    clearCache,
    updateCache
}
