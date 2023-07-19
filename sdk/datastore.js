//https://data.medicaid.gov/api/1/datastore/imports/ {distribution id}
import {getItems, postItem} from './httpMethods.js';

async function getDatastoreImport(distributionId){
    const distributionColumns = await getItems(`datastore/imports/${distributionId}`);
    if (distributionColumns === undefined){
        throw new Error("An error occurred in retrieving the distribution information. Please check the provided Id.")
    }
    return distributionColumns;
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
    let response = await postItem('datastore/query', requestBody, headers);
    if (response === undefined){
        throw new Error("An error occurred in the distribution post query. ")
    }
    return response["results"];
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
    let response = await postItem('datastore/query/download', requestBody, headers, true);
    if (response === undefined){
        throw new Error("An error occurred in the distribution post query.")
    }
    return response;
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
    let response = await postItem(`datastore/query/${distributionId}`, requestBody, headers);
    if (response === undefined){
        throw new Error("An error occurred in the distribution post query.")
    }
    return response["results"];
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
    let response = await postItem(`datastore/query/${datasetId}/0`, requestBody, headers);
    if (response === undefined){
        throw new Error("An error occurred in the dataset post query. ")
    }
    return response["results"];
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
    const fetchPromises = [];
    if (limit === 0) {
        return []; // Return an empty array if the limit is 0
    }
    const maxLimit = 10000;
    for (let currentOffset = offset; limit > 0; currentOffset += maxLimit) {
        const currentLimit = Math.min(limit, maxLimit);
        fetchPromises.push(getItems(`datastore/query/${schemaId}?limit=${currentLimit}&offset=${currentOffset}`));
        limit -= currentLimit;
    }
    const responses = await Promise.all(fetchPromises);
    return responses.flatMap(response => response["results"]);
}

async function datastoreQueryNoLimit(schemaId, offset){
    //executes get request for datastore query, getting all possible elements
    let condition = true
    let allData = [];
    let responses = [];
    while (condition){
        const promises = [];
        for (let i = 0; i < 3; i++) {
            promises.push(getItems(`datastore/query/${schemaId}?limit=10000&offset=${offset}`));
            offset += 10000;
        }
        responses = await Promise.all(promises);
        allData.push(...responses.flatMap(response => response["results"]))
        if (responses.some(response => response["results"].length !== 10000)){
            condition = false;
        }
    }
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