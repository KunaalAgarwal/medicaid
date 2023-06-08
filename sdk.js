const loadedAt = `Medicaid SDK loaded at \n${Date()}`;
const baseUrl = 'https://data.medicaid.gov/api/1/';
let cache = {};

import {
    getAllDatasetUrls,
    getDatasetByDescription,
    getDatasetById,
    getDatasetByKeyword,
    getDatasetByTitleName,
    getSchemaItemById,
    getSchemaItems,
    getSchemas,
    getSpecificSchema
} from './sdk/metastore.js';

import {
    postDatastoreQuery,
    getDatastoreImport,
    postDatastoreQueryDownload,
    postDatastoreQueryDistributionId,
    postDatastoreQueryDatasetId,
    getDatastoreQueryDistributionId,
    getDatastoreQueryDatasetId,
    getAllDataFromDataset
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

async function postItem(endpoint, payload, headerContent) {
    const options = {
        method: 'POST',
        headers: headerContent,
        body: JSON.stringify(payload)
    };
    try {
        const response = await fetch(baseUrl + endpoint, options);
        if (response.ok) {
            return await response.json();
        }else if(response.status === 503){
            console.log("API Service temporarily unavailable");
        }
        else {
            console.log("Invalid json or identifier");
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function postDownloadableItem(endpoint, payload, headerContent) {
    const options = {
        method: 'POST',
        headers: headerContent,
        body: JSON.stringify(payload)
    };
    try {
        const response = await fetch(baseUrl + endpoint, options);
        if (response.ok) {
            return await response.blob();
        }else if(response.status === 503){
            console.log("API Service temporarily unavailable");
        }
        else {
            console.log("Invalid json or identifier");
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
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
    postDownloadableItem,
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
    postDatastoreQuery,
    postDatastoreQueryDownload,
    postDatastoreQueryDistributionId,
    postDatastoreQueryDatasetId,
    getDatastoreQueryDistributionId,
    getDatastoreQueryDatasetId,
    getAllDataFromDataset
}



