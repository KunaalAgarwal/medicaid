import localforage from 'https://cdn.skypack.dev/localforage';
let updateCount = 0;
const dbName = "localforage"

localforage.config({
    driver: [
        localforage.INDEXEDDB,
        localforage.LOCALSTORAGE,
        localforage.WEBSQL
    ],
    name: 'localforage'
});

let endpointStore = localforage.createInstance({
    name: dbName,
    storeName: "endpointStore"
})
let timestore = localforage.createInstance({
    name: dbName,
    storeName: "timestore"
})

async function getItems(endpoint, downloadFlag = false, baseUrl = 'https://data.medicaid.gov/api/1/') {
    try {
        updateCache();
        const timeStamp = Date.now();
        const cachedData = await endpointStore.getItem(endpoint);
        if (cachedData !== null) {
            timestore.setItem(endpoint, timeStamp);
            return cachedData;
        }
        const response = await fetch(`${baseUrl}${endpoint}`);
        if (!response.ok){
            throw new Error("An error occurred in the API get Request");
        }
        let responseData;
        if (downloadFlag) {
            responseData = await response.blob();
        } else {
            responseData = await response.json();
        }
        endpointStore.setItem(endpoint, responseData);
        timestore.setItem(endpoint, timeStamp);
        return responseData;
    } catch (error) {
        console.log(error);
    }
}


async function postItem(endpoint, payload, headerContent, downloadFlag = false, baseUrl = 'https://data.medicaid.gov/api/1/') {
    try {
        const options = {
            method: 'POST',
            headers: headerContent,
            body: JSON.stringify(payload)
        };
        updateCache();
        const timeStamp = Date.now();
        const cachedData = await endpointStore.getItem(options.body);
        if (cachedData !== null) {
            timestore.setItem(options.body, timeStamp);
            return cachedData;
        }
        const response = await fetch(`${baseUrl}${endpoint}`, options);
        if (!response.ok){
            throw new Error("An error occurred in the API post request.")
        }
        let responseData;
        if (downloadFlag) {
            responseData = await response.blob();
        } else {
            responseData = await response.json();
        }
        endpointStore.setItem(options.body, responseData);
        timestore.setItem(options.body, timeStamp);
        return responseData;
    } catch (error) {
        console.log(error);
    }
}

function updateCache() {
    try {
        if (updateCount < 10000) {
            updateCount++;
            return;
        }
        const timeStamp = Date.now();
        timestore.keys().then(keys => {
            keys.forEach(key => {
                timestore.getItem(key).then(value => {
                    if (timeStamp - value > 86400000) { // 24 hours in ms
                        timestore.removeItem(key);
                        endpointStore.removeItem(key);
                    }
                });
            });
        });
        updateCount = 0;
    } catch (error) {
        console.log("The cache could not be updated");
    }
}

function clearCache(){
    endpointStore.clear();
    timestore.clear();
}

export{
    getItems,
    postItem,
    clearCache,
    localforage,
    endpointStore
}
