//https://data.medicaid.gov/api/1/datastore/imports/ {distribution id}
import {getItems, postItem} from './httpMethods.js';

async function getDatastoreImport(distributionId){
    return await getItems(`datastore/imports/${distributionId}`);
}

//datastore: query
async function postDatastoreQuery(distributionId, columnName, columnValue, operator = "=", limit = 0) {
    let headers = {'Content-Type': 'application/json'}
    if (limit > 10000){limit = 10000}
    let requestBody = {
        "conditions": [
            {
                "resource": "t",
                "property": columnName,
                "value": columnValue,
                "operator": operator
            }
        ],
        "limit": limit,
        "resources": [
            {
                "id": `${distributionId}`,
                "alias": "t"
            },
        ]
    }
    try{
        let response = await postItem('datastore/query', requestBody, headers);
        return response["results"];
    }catch (Error){
        console.log("The post could not be fulfilled.");
    }
}
async function postDatastoreQueryDownload(distributionId, columnName, columnValue, operator = "=", limit = 0){
    let headers = {'Content-Type': 'text/csv'}
    if (limit > 10000){limit = 10000}
    let requestBody = {
        "conditions": [
            {
                "resource": "t",
                "property": columnName,
                "value": columnValue,
                "operator": operator
            }
        ],
        "limit": limit,
        "resources": [
            {
                "id": `${distributionId}`,
                "alias": "t"
            }
        ],
        "format": "csv"
    }
    return await postItem('datastore/query/download', requestBody, headers, true);
}

async function postDatastoreQueryDistributionId(distributionId, columnName, columnValue, operator = "=", limit = 0){
    let headers = {'Content-Type': 'application/json'}
    if (limit > 10000){limit = 10000}
    let requestBody = {
        "conditions": [
            {
                "resource": "t",
                "property": columnName,
                "value": columnValue,
                "operator": operator
            }
        ],
        "limit": limit
    }
    try{
        let response = await postItem(`datastore/query/${distributionId}`, requestBody, headers);
        return response["results"];
    }catch (Error){
        console.log("The post could not be fulfilled.");
    }
}

async function postDatastoreQueryDatasetId(datasetId, columnName, columnValue, operator = "=", limit = 0){
    let headers = {'Content-Type': 'application/json'}
    if (limit > 10000){limit = 10000}
    let requestBody = {
        "conditions": [
            {
                "resource": "t",
                "property": columnName,
                "value": columnValue,
                "operator": operator
            }
        ],
        "limit": limit
    }
    try{
        let response = await postItem(`datastore/query/${datasetId}/0`, requestBody, headers);
        return response["results"];
    }catch (Error){
        console.log("The post could not be fulfilled.");
    }
}
async function getDatastoreQueryDistributionId(distributionId, limit = null, offset = 0){
    try {
        if (limit !== null) {
            return await datastoreQueryWithLimit(distributionId, limit, offset)
        }
        return await datastoreQueryNoLimit(distributionId, offset);
    } catch (error) {
        console.log("The request could not be fulfilled.", error);
    }
}

async function getDatastoreQueryDatasetId(datasetId, limit = null, offset = 0) {
    try {
        if (limit !== null) {
            return await datastoreQueryWithLimit(`${datasetId}/0`, limit, offset)
        }
        return await datastoreQueryNoLimit(`${datasetId}/0`, offset);
    } catch (error) {
        console.log("The request could not be fulfilled.", error);
    }
}

async function datastoreQueryWithLimit(schemaId, limit, offset) {
    //executes get request for datastore queries given a limit
    const allData = []
    if (limit !== null) {
        while (limit > 0) {
            const currentLimit = Math.min(limit, 10000);
            const items = await getItems(`datastore/query/${schemaId}?limit=${currentLimit}&offset=${offset}`);
            allData.push(...items["results"]);
            offset += currentLimit;
            limit -= currentLimit;
        }
        return allData;
    }
}

async function datastoreQueryNoLimit(schemaId, offset){
    //executes get request for datastore query, getting all possible elements
    let allData = [];
    let responses = [];
    do {
        const promises = [];
        for (let i = 0; i < 5; i++) { // Adjust the number of parallel requests as needed
            promises.push(getItems(`datastore/query/${schemaId}?limit=10000&offset=${offset}`));
            offset += 10000;
        }
        responses = await Promise.all(promises);
        responses.forEach(response => allData.push(...response["results"]));
    } while (responses.some(response => response["results"].length === 10000));
    return allData;
}

async function getAllDataFromDistribution(distributionId){
    return await getDatastoreQueryDistributionId(distributionId);
}
async function getAllDataFromDataset(datasetId) {
    return await getDatastoreQueryDatasetId(datasetId);
}

async function getDownloadByDistributionId(distributionId, format = "csv"){
    return await getItems(`datastore/query/${distributionId}/download?format=${format}`, true);
}

async function getDownloadByDatasetId(datasetId, format = "csv"){
    return await getItems(`datastore/query/${datasetId}/0/download?format=${format}`, true);
}

function createDownloadLink(blob, filename = 'filename.ext', textContent = 'Download file') {
    try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.textContent = textContent;
        const cleanupLink = () => {
            URL.revokeObjectURL(url);
            link.remove();
        };

        link.addEventListener('click', () => {
            setTimeout(cleanupLink, 1000);
        });

        setTimeout(cleanupLink, 15000);
        return link;
    } catch (error) {
        console.log('The downloadable link could not be created.');
    }
}


export{
    getDatastoreImport,
    postDatastoreQuery,
    postDatastoreQueryDownload,
    postDatastoreQueryDistributionId,
    postDatastoreQueryDatasetId,
    getDatastoreQueryDistributionId,
    getDatastoreQueryDatasetId,
    getAllDataFromDataset,
    getAllDataFromDistribution,
    getDownloadByDistributionId,
    getDownloadByDatasetId,
    createDownloadLink
}