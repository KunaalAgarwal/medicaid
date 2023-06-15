const baseUrl = 'https://data.medicaid.gov/api/1/';
import localforage from 'https://cdn.skypack.dev/localforage';

async function getItems(endpoint, downloadFlag = false) {
    try{
        const cachedData = await localforage.getItem(endpoint);
        if (cachedData !== null) {
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
            await localforage.setItem(endpoint, responseData);
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
    try {
        const response = await fetch(baseUrl + endpoint, options);
        if (response.ok){
            let responseData;
            if (downloadFlag){
                responseData = await response.blob();
                console.log(responseData)
            } else {
                responseData = await response.json();
            }
            return responseData
        }
        else {
            console.log("Invalid json or identifier");
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

export{
    getItems,
    postItem
}

