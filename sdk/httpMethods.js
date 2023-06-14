const baseUrl = 'https://data.medicaid.gov/api/1/';
let cache = {};
async function getItems(endpoint, downloadFlag = false) {
    if (cache[endpoint] !== undefined) {
        return cache[endpoint];
    } else {
        cache[endpoint] = fetch(baseUrl + endpoint)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`API response was invalid`);
                }
                if (downloadFlag){
                    return response.blob();
                }
                return response.json();
            })
            .then((data) => {
                cache[endpoint] = data; // Cache the response
                return data;
            })
            .catch((error) => {
                delete cache[endpoint]; // Remove the entry from cache in case of error
                console.log(endpoint)
                // throw error;
            });
        return cache[endpoint];
    }
}

// async function getItems(endpoint, downloadFlag = false) {
//     try{
//         const cachedData = localStorage.getItem(endpoint);
//         if (cachedData !== null) {
//             return JSON.parse(cachedData);
//         }
//         const response = await fetch(baseUrl + endpoint);
//         if (response.ok){
//             let responseData;
//             if (downloadFlag){
//                 responseData = await response.blob();
//             } else {
//                 responseData = await response.json();
//             }
//             localStorage.setItem(endpoint, JSON.stringify(responseData));
//             return responseData
//         }
//     } catch (Error){
//         console.log("An error occurred in the API request.")
//     }
// }

async function postItem(endpoint, payload, headerContent, downloadFlag = false) {
    const options = {
        method: 'POST',
        headers: headerContent,
        body: JSON.stringify(payload)
    };
    try {
        const cacheKey = JSON.stringify(endpoint);
        const cachedData = localStorage.getItem(cacheKey)
        if (cachedData !== null){
            return JSON.parse(cachedData)
        }
        const response = await fetch(baseUrl + endpoint, options);
        if (response.ok){
            let responseData;
            if (downloadFlag){
                responseData = await response.blob();
            } else {
                responseData = await response.json();
            }
            localStorage.setItem(endpoint, JSON.stringify(responseData));
            return responseData
        }
    } catch (error) {
        console.log("An error occurred in the API post");
    }
}

export{
    getItems,
    postItem
}

