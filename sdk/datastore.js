import {getItems, postItem} from './httpMethods.js';

async function getDatastoreImport(distributionId){
    const distributionColumns = await getItems(`datastore/imports/${distributionId}`);
    if (distributionColumns === undefined){
        throw new Error("An error occurred in retrieving the distribution information. Please check the provided Id.")
    }
    return distributionColumns;
}

//datastore: query
async function postDatastoreQueryDistributionId(distributionId, queryParams = {columnName: "", columnValue: "", operator: "=", limit: 0}){
    let headers = {'Content-Type': 'application/json'}
    if (queryParams.limit > 10000){queryParams.limit = 10000}
    let requestBody = {
        "conditions": [
            {
                "resource": "t",
                "property": queryParams.columnName,
                "value": queryParams.columnValue,
                "operator": queryParams.operator
            }
        ],
        "limit": queryParams.limit
    }
    let response = await postItem(`datastore/query/${distributionId}`, requestBody, headers);
    if (response === undefined){
        throw new Error("An error occurred in the distribution post query.")
    }
    return response["results"];
}

async function postDatastoreQueryDatasetId(datasetId, queryParams = {columnName: "", columnValue: "", operator: "=", limit: 0}){
    let headers = {'Content-Type': 'application/json'}
    if (queryParams.limit > 10000){queryParams.limit = 10000}
    let requestBody = {
        "conditions": [
            {
                "resource": "t",
                "property": queryParams.columnName,
                "value": queryParams.columnValue,
                "operator": queryParams.operator
            }
        ],
        "limit": queryParams.limit
    }
    let response = await postItem(`datastore/query/${datasetId}/0`, requestBody, headers);
    if (response === undefined){
        throw new Error("An error occurred in the dataset post query. ")
    }
    return response["results"];
}

async function getDatastoreQueryDistributionId(distributionId, limit = null, offset = 0){
    if (limit !== null) {
        return await datastoreQueryWithLimit(distributionId, limit, offset)
    }
    return await datastoreQueryNoLimit(distributionId, offset);
}

async function getDatastoreQueryDatasetId(datasetId, limit = null, offset = 0) {
    if (limit !== null) {
        return await datastoreQueryWithLimit(`${datasetId}/0`, limit, offset)
    }
    return await datastoreQueryNoLimit(`${datasetId}/0`, offset);
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
    const result = responses.flatMap(response => response["results"]);
    if (result === undefined){
        throw new Error("The datastore could not be queried.")
    }
    return result;
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

async function getDownloadByDistributionId(distributionId, downloadParams = {convertBlob: true, filename: "filename.ext", textContent: "Download File"}){
    const response = await getItems(`datastore/query/${distributionId}/download?format=csv`, {blobFlag: true, cacheFlag: true, baseUrl: 'https://data.medicaid.gov/api/1/'});
    if (downloadParams.convertBlob){
        return createDownloadLink(response, downloadParams.filename, downloadParams.textContent);
    }
    return response;
}

async function getDownloadByDatasetId(datasetId, downloadParams = {convertBlob: true, filename: "filename.ext", textContent: "Download File"}){
    const response = await getItems(`datastore/query/${datasetId}/0/download?format=csv`, {blobFlag: true, cacheFlag: true, baseUrl: 'https://data.medicaid.gov/api/1/'});
    if (downloadParams.convertBlob){
        return createDownloadLink(response, downloadParams.filename, downloadParams.textContent);
    }
    return response;
}

async function postDatastoreQueryDownload(distributionId, queryParams = {columnName: "", columnValue: "", operator: "=", limit: 0}, downloadParams = {convertBlob: true, filename: "filename.ext", textContent: "Download File"}){
    let headers = {'Content-Type': 'text/csv'}
    if (queryParams.limit > 10000){queryParams.limit = 10000}
    let requestBody = {
        "conditions": [
            {
                "resource": "t",
                "property": queryParams.columnName,
                "value": queryParams.columnValue,
                "operator": queryParams.operator
            }
        ],
        "limit": queryParams.limit,
        "resources": [
            {
                "id": `${distributionId}`,
                "alias": "t"
            }
        ],
        "format": "csv"
    }
    let response = await postItem('datastore/query/download', requestBody, headers, {blobFlag: true, cacheFlag: true, baseUrl: 'https://data.medicaid.gov/api/1/'});
    if (response === undefined){
        throw new Error("An error occurred in the distribution post query.")
    }
    if (downloadParams.convertBlob){
        return createDownloadLink(response, downloadParams.filename, downloadParams.textContent);
    }
    return response;
}

function createDownloadLink(blob, filename, textContent) {
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
        return link;
    } catch (error) {
        console.log('The downloadable link could not be created.');
    }
}

export{
    getDatastoreImport,
    postDatastoreQueryDownload,
    postDatastoreQueryDistributionId,
    postDatastoreQueryDatasetId,
    getDatastoreQueryDistributionId,
    getDatastoreQueryDatasetId,
    getAllDataFromDataset,
    getAllDataFromDistribution,
    getDownloadByDistributionId,
    getDownloadByDatasetId
}