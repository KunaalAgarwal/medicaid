const baseUrl = 'https://data.medicaid.gov/api/1/';

async function getItems(endpoint, downloadFlag = false) {
    try{
        const cachedData = localStorage.getItem(endpoint);
        if (cachedData !== null) {
            return JSON.parse(cachedData);
        }
        const response = await fetch(baseUrl + endpoint);
        if (response.ok){
            let responseData;
            if (downloadFlag){
                responseData = response.blob();
                localStorage.setItem(endpoint, JSON.stringify(responseData));
                return responseData;
            }

            responseData = response.json();
            localStorage.setItem(endpoint, JSON.stringify(responseData));
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
        const cacheKey = JSON.stringify(options.headers);
        const cachedData = localStorage.getItem(cacheKey)
        if (cachedData !== null){
            return JSON.parse(cachedData)
        }
        const response = await fetch(baseUrl + endpoint, options);
        if (response.ok) {
            let responseData;
            if (downloadFlag){
                responseData = response.blob();
                localStorage.setItem(JSON.stringify(options.headers), JSON.stringify(responseData));
                return responseData
            }
            responseData = response.json()
            localStorage.setItem(JSON.stringify(options.headers), JSON.stringify(responseData));
            return responseData;
        }
    } catch (error) {
        console.log("An error occurred in the API post");
    }
}

export{
    getItems,
    postItem
}


