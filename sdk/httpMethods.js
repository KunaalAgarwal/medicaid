const baseUrl = 'https://data.medicaid.gov/api/1/';
import localforage from 'https://cdn.skypack.dev/localforage';
let updateCount = 0;

async function getItems(endpoint, downloadFlag = false) {
    try{
        const timeStamp = Date.now();
        const cachedData = await localforage.getItem(endpoint);
        if (cachedData !== null) {
            localStorage.setItem(`${endpoint}time`, timeStamp);
            updateCount++;
            await updateCache();
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
            localStorage.setItem(`${endpoint}time`, timeStamp);
            updateCount++;
            await updateCache();
            return responseData
        }
    } catch (Error){
        console.log("An error occurred in the API request.")
    }
}

async function postItem(endpoint, payload, headerContent, downloadFlag = false) {
    const options = {
        method: 'POST',
        headers: headerContent,
        body: JSON.stringify(payload)
    };
    const timeStamp = Date.now();
    try {
        const cachedData = await localforage.getItem(options.body)
        if (cachedData !== null){
            localStorage.setItem(`${options.body}time`, timeStamp);
            updateCount++;
            await updateCache();
            return cachedData
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
            localStorage.setItem(`${options.body}time`, timeStamp);
            updateCount++
            await updateCache();
            return responseData
        }
    } catch (error) {
        console.log("An error occurred in the API post");
    }
}

async function updateCache(){
    try{
        if (updateCount < 10) {return}
        const timeStamp = Date.now();
        for (let i in Object.keys(localStorage)){
            const value = Number.parseInt(localStorage.getItem(localStorage.key(i)))
            if (timeStamp - value > 86400000){ //24 hours in ms
                let key = (localStorage.key(i)).split("time")[0]
                localStorage.removeItem(localStorage.key(i))
                localforage.removeItem(key)
            }
        }
        updateCount = 0;
    } catch(error){
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
    clearCache
}

