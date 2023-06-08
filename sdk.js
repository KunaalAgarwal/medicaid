const loadedAt = `Medicaid SDK loaded at \n${Date()}`;
const baseUrl = 'https://data.medicaid.gov/api/1/';
let cache = {};

import {
    getSchemas,
    getSpecificSchema,
    getSchemaItems,
    getAllDatasetUrls,
    getDatasetByTitleName,
    getDatasetByKeyword,
    getDatasetByDescription,
    getSchemaItemById,
    getDatasetById
} from './sdk/metastore.js';

import {
    getDatastoreImport,
    datastoreQuery
} from './sdk/datastore.js';


async function fetchItems(endpoint) {
    if (cache[endpoint] !== undefined) {
        return cache[endpoint];
    } else {
        cache[endpoint] = fetch(baseUrl + endpoint)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`API response was invalid`);
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
        return cache[endpoint];
    }
}

async function postItem(endpoint, payload, headerContent){
    const options = {
        method: "POST",
        headers: headerContent,
        body: JSON.stringify(payload)
    }
    return fetch(baseUrl+endpoint,options)
        .then(response => response.json())
        .then(data => {
            return data
        })
        .catch(error => {
            console.log('An error occurred when creating the item.');
        });
}

// async function deleteItem(endpoint){
//     const options = {
//         method: 'DELETE'
//     }
//     return fetch(baseUrl+endpoint)
//         .then(response => {
//             console.log('Dataset deleted');
//         })
//         .catch(error => {
//             console.log('An error occurred when creating the item.');
//         });
// }


export {
    fetchItems,
    postItem,
    getSchemas,
    getSpecificSchema,
    getSchemaItems,
    getAllDatasetUrls,
    getDatasetByTitleName,
    getDatasetByKeyword,
    getDatasetByDescription,
    getSchemaItemById,
    getDatasetById,
    //datastore
    getDatastoreImport,
    datastoreQuery
}



