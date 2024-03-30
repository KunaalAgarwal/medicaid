let endpointStore;
let updateCount = 0;
class NodeStorage {
    constructor() {
        this.storageObj = {};
    }
    clear() {
        return Promise.resolve(this.storageObj = {});
    }
    setItem(key, value) {
        this.storageObj[key] = value;
        return Promise.resolve();
    }
    getItem(key) {
        return Promise.resolve(this.storageObj[key] || null);
    }
    removeItem(key) {
        delete this.storageObj[key];
        return Promise.resolve();
    }
    keys() {
        return Promise.resolve(Object.keys(this.storageObj));
    }
}

async function localForageConfig() {
    return typeof window === undefined ? await cdnConfig() : new NodeStorage();
}

async function cdnConfig() {
    try {
        let localforage = await import('https://cdn.skypack.dev/localforage');
        return localforage.createInstance({
            name: "localforage",
            storeName: "endpointStore"
        });
    } catch (error) {
        await import('https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js');
        return window.localforage.createInstance({
            name: "localforage",
            storeName: "endpointStore"
        });
    }
}

endpointStore = await localForageConfig();

async function getItems(endpoint, requestParams = {blobFlag: false, cacheFlag: true, baseUrl: 'https://data.medicaid.gov/api/1/'}) {
    await updateCache();
    const cachedData = await endpointStore.getItem(endpoint);
    if (cachedData !== null) {
        endpointStore.setItem(endpoint, {response: cachedData.response, time: Date.now()});
        return cachedData.response;
    }
    const response = await fetch(`${requestParams.baseUrl}${endpoint}`);
    if (!response.ok){
        throw new Error("An error occurred in the API get Request");
    }
    let responseData;
    if (requestParams.blobFlag) {
        responseData = await response.blob();
    } else {
        responseData = await response.json();
    }
    if (requestParams.cacheFlag) endpointStore.setItem(endpoint, {response: responseData, time: Date.now()});
    return responseData;
}

async function postItem(endpoint, payload, headerContent, requestParams = {blobFlag: false, cacheFlag: true, baseUrl: 'https://data.medicaid.gov/api/1/'}) {
    const options = {
        method: 'POST',
        headers: headerContent,
        body: JSON.stringify(payload)
    };
    await updateCache();
    const cachedData = await endpointStore.getItem(options.body);
    if (cachedData !== null) {
        endpointStore.setItem(options.body, {response: cachedData.response, time: Date.now()})
        return cachedData.response;
    }
    const response = await fetch(`${requestParams.baseUrl}${endpoint}`, options);
    if (!response.ok){
        throw new Error("An error occurred in the API post request.")
    }
    let responseData;
    if (requestParams.blobFlag) {
        responseData = await response.blob();
    } else {
        responseData = await response.json();
    }
    if (requestParams.cacheFlag) endpointStore.setItem(options.body, {response: responseData, time: Date.now()});
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
    clearCache,
    endpointStore
}