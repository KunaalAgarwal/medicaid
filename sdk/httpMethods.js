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

async function getItems(endpoint, blobFlag = false, baseUrl = 'https://data.medicaid.gov/api/1/') {
    await updateCache();
    const cachedData = await endpointStore.getItem(endpoint);
    if (cachedData !== null) {
        endpointStore.setItem(endpoint, {response: cachedData.response, time: Date.now()});
        return cachedData.response;
    }
    const response = await fetch(`${baseUrl}${endpoint}`);
    if (!response.ok){
        throw new Error("An error occurred in the API get Request");
    }
    let responseData;
    if (blobFlag) {
        responseData = await response.blob();
    } else {
        responseData = await response.json();
    }
    endpointStore.setItem(endpoint, {response: responseData, time: Date.now()});
    return responseData;
}
async function postItem(endpoint, payload, headerContent, blobFlag = false, baseUrl = 'https://data.medicaid.gov/api/1/') {
    const options = {
        method: 'POST',
        headers: headerContent,
        body: JSON.stringify(payload)
    };
    //await  updateCache();
    const cachedData = await endpointStore.getItem(options.body);
    if (cachedData !== null) {
        endpointStore.setItem(options.body, {response: cachedData.response, time: Date.now()})
        return cachedData.response;
    }
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    if (!response.ok){
        throw new Error("An error occurred in the API post request.")
    }
    let responseData;
    if (blobFlag) {
        responseData = await response.blob();
    } else {
        responseData = await response.json();
    }
    endpointStore.setItem(options.body, {response: responseData, time: Date.now()});
    return responseData;
}

async function updateCache() {
    if (updateCount < 10000){
        updateCount++;
        return;
    }
    console.log("Cache is being updated")
    for (const key of await endpointStore.keys()) {
        const value = await endpointStore.getItem(key);
        if (Date.now() - value.time > 86400000){
            endpointStore.removeItem(key);
        }
    }
    updateCount = 0;
}

function clearCache(){
    endpointStore.clear();
}

export{
    getItems,
    postItem,
    clearCache
}
