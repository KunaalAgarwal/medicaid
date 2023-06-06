const loadedAt = `Medicaid SDK loaded at \n${Date()}`;
const baseUrl = "https://data.medicaid.gov/api/1/";
let cache = {};

import {
    getItemByTitleName,
    getItemByKeyword,
    getItemByDescription,
    getItemByIdentifier,
    filterItemsByIdentifier
} from './metastore.js';

async function fetchItems(endpoint) {
    if (cache[endpoint] !== undefined) {
        return cache[endpoint];
    } else {
        cache[endpoint] = fetch(baseUrl + endpoint)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('API response was invalid');
                }
                return response.json();
            })
            .then((data) => {
                cache[endpoint] = data; // Cache the response
                return data;
            })
            .catch((error) => {
                delete cache[endpoint]; // Remove the entry from cache in case of error
                throw error;
            });
        console.log(loadedAt);
        return cache[endpoint];
    }
}


export {
    fetchItems,
    getItemByTitleName,
    getItemByKeyword,
    getItemByDescription,
    getItemByIdentifier,
    filterItemsByIdentifier
}



