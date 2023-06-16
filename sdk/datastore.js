//'11196f15-1a77-5b80-97f3-c46c0ce19894' small distribution id
// 7d91ef5c-c0c0-5511-9b83-2d5170fdb05b nadac distribution id
//'d5eaf378-dcef-5779-83de-acdd8347d68e' nadac dataset id
//88b0eac5-6164-5737-b746-16eaefd52664 big nadac distribution id

//https://data.medicaid.gov/api/1/datastore/imports/ {distribution id}
import {getItems, postItem} from './httpMethods.js';

async function getDatastoreImport(datastoreId){
    try {
        return await getItems(`datastore/imports/${datastoreId}`);
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

//datastore: query
async function postDatastoreQuery(datastoreId, columnName, columnValue,operator = "=", limit = 0) {
    let headers = {'Content-Type': 'application/json'}
    if (limit > 10000){limit = 10000}
    let requestBody = {
        "conditions": [
            {
                "resource": "t",
                "property": columnName,
                "value": columnValue,
                "operator": `${operator}`
            }
        ],
        "limit": limit,
        "resources": [
            {
                "id": `${datastoreId}`,
                "alias": "t"
            },
        ]
    }
    try{
        let response = await postItem('datastore/query', requestBody, headers);
        return response.results;
    }catch (Error){
        console.log("The post could not be fulfilled.");
    }
}
async function postDatastoreQueryDownload(datastoreId, columnName, columnValue, operator = "=", limit = 0){
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
                "id": `${datastoreId}`,
                "alias": "t"
            }
        ],
        "format": "csv"
    }
    try{
        return await postItem('datastore/query/download', requestBody, headers, true);
    }catch (Error){
        console.log("The post could not be fulfilled.");
    }
}

async function postDatastoreQueryDistributionId(datastoreId, columnName, columnValue, operator = "=", limit = 0){
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
        let response = await postItem(`datastore/query/${datastoreId}`, requestBody, headers);
        return response.results;
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
        return response.results;
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
            allData.push(...items.results);
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
        responses.forEach(response => allData.push(...response.results));
    } while (responses.some(response => response.results.length === 10000));
    return allData;
}

async function getAllDataFromDistribution(distributionId){
    return await getDatastoreQueryDistributionId(distributionId);
}
async function getAllDataFromDataset(datasetId) {
    return await getDatastoreQueryDatasetId(datasetId);
}

async function getDownloadByDistributionId(distributionId, format = "csv"){
    try{
        return await getItems(`datastore/query/${distributionId}/download?format=${format}`, true);
    }catch(Error){
        console.log("The request could not be fulfilled");
    }
}

async function getDownloadByDatasetId(datasetId, format = "csv"){
    try{
        return await getItems(`datastore/query/${datasetId}/0/download?format=${format}`, true);
    }catch(Error){
        console.log("The request could not be fulfilled");
    }
}
function createDownloadLink(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'filename.ext'; // Replace with your desired filename and extension
    link.textContent = 'Download file';

    // Trigger the download and remove the element when the user clicks the link
    link.addEventListener('click', () => {
        setTimeout(() => {
            URL.revokeObjectURL(url);
            link.remove();
        }, 1000); // Adjust the delay as needed
    });

    return link;
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