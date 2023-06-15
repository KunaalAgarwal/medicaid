//'11196f15-1a77-5b80-97f3-c46c0ce19894' small distribution id
// 7d91ef5c-c0c0-5511-9b83-2d5170fdb05b nadac distribution id
//'d5eaf378-dcef-5779-83de-acdd8347d68e' nadac dataset id

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
async function getDatastoreQueryDistributionId(distributionId, limit = null, offset = 0){
//offset is starting index, if limit is zero then having an offset will lead to a null array
    try {
        const allData = [];
        const maxLimit = 10000;
        let results = [];


        if (limit !== null) {
            while (limit > 0) {
                const currentLimit = Math.min(limit, maxLimit);
                const items = await getItems(`datastore/query/${distributionId}?limit=${currentLimit}&offset=${offset}`);
                results = items.results;
                allData.push(...results);
                offset += currentLimit;
                limit -= currentLimit;
            }
            return allData;
        }

        do {
            const promises = [];
            for (let i = 0; i < 5; i++) { // Adjust the number of parallel requests as needed
                promises.push(getItems(`datastore/query/${distributionId}?limit=${maxLimit}&offset=${offset}`));
                offset += maxLimit;
            }
            results = await Promise.all(promises);
            results.forEach(result => allData.push(...result.results));
        } while (results.some(result => result.results.length === maxLimit));

        return allData;
    } catch (error) {
        console.log("The request could not be fulfilled.", error);
    }
}

async function postDatastoreQueryDistributionId(datastoreId, columnName, columnValue, operator = "=", limit = 0){
    let headers = {'Content-Type': 'application/json'}
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



async function getDatastoreQueryDatasetId(datasetId, limit = null, offset = 0) {
    try {
        const allData = [];
        const maxLimit = 10000;
        let results = [];

        if (limit !== null) {
            while (limit > 0) {
                const currentLimit = Math.min(limit, maxLimit);
                const items = await getItems(`datastore/query/${datasetId}/${0}?limit=${currentLimit}&offset=${offset}`);
                results = items.results;
                allData.push(...results);
                offset += currentLimit;
                limit -= currentLimit;
            }
            return allData;
        }

        do {
            const promises = [];
            for (let i = 0; i < 5; i++) { // Adjust the number of parallel requests as needed
                promises.push(getItems(`datastore/query/${datasetId}/${0}?limit=${maxLimit}&offset=${offset}`));
                offset += maxLimit;
            }
            results = await Promise.all(promises);
            results.forEach(result => allData.push(...result.results));
        } while (results.some(result => result.results.length === maxLimit));

        return allData;
    } catch (error) {
        console.log("The request could not be fulfilled.", error);
    }
}

async function postDatastoreQueryDatasetId(datasetId, columnName, columnValue, operator = "=", limit = 0){
    let headers = {'Content-Type': 'application/json'}
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

async function getAllDataFromDistribution(distributionId){
    return await getDatastoreQueryDistributionId(distributionId);
}
async function getAllDataFromDataset(datasetId) {
    return getDatastoreQueryDatasetId(datasetId);
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

async function getDatastoreQuerySql(sqlQuery, showColumnFlag = true) {
    try {
        let baseEndpoint = `datastore/sql?query=${sqlQuery}&show_db_columns=${showColumnFlag}`;
        let limit = parseLimit(sqlQuery);
        if (limit <= 10000 && limit !== null){
            return await getItems(baseEndpoint);
        }
        else if (limit > 10000){
            return await sqlHighLimit(sqlQuery, baseEndpoint, showColumnFlag);
        }
        return await sqlNoLimit(sqlQuery, baseEndpoint, showColumnFlag);

    } catch (Error) {
        console.log("The request could not be fulfilled");
    }
}

function parseOffset(query) {
    if (query.includes("OFFSET")) {
        let offset = query.split("OFFSET")[1].trimStart().split("]")[0]
        return parseInt(offset);
    }
    return 0;
}

function parseLimit(query){
    if (query.includes("LIMIT")) {
        let limit = (query.split("LIMIT")[1].trimStart().split(" ")[0]).split("]")[0]
        return parseInt(limit)
    }
    return null;
}

async function sqlHighLimit(sqlQuery, baseEndpoint, showColumnFlag){
    let allData = [];
    let offset = parseOffset(sqlQuery)
    let limit = parseLimit(sqlQuery)
    while (limit > 0) {
        let currentLimit = Math.min(limit, 10000);
        let updatedQuery;
        if (offset > 0){
            updatedQuery = sqlQuery.replace(/\[LIMIT \d+/, `[LIMIT ${currentLimit}`).replace(/\[OFFSET \d+\]/, `[OFFSET ${offset}]`);
        } else {
            updatedQuery = sqlQuery.replace(/\[LIMIT \d+/, `[LIMIT ${currentLimit}`)
        }
        baseEndpoint = `datastore/sql?query=${updatedQuery}&show_db_columns=${showColumnFlag}`;
        const results = await getItems(baseEndpoint);
        allData.push(...results);
        offset += currentLimit;
        limit -= currentLimit;
    }
    return allData;
}

async function sqlNoLimit(sqlQuery, baseEndpoint, showColumnFlag){
    let allData = [];
    let limit = 10000;
    let offset = parseOffset(sqlQuery);
    while (true) {
        let adjustedQuery;
        if (sqlQuery.includes("OFFSET")){
            adjustedQuery = sqlQuery.replace(/OFFSET \d+\]/, `LIMIT ${limit} OFFSET ${offset}]`);
        }
        else {
            adjustedQuery = `${sqlQuery}[LIMIT ${limit} OFFSET ${offset}]`;
        }

        baseEndpoint = `datastore/sql?query=${adjustedQuery}&show_db_columns=${showColumnFlag}`;
        const results = await getItems(baseEndpoint);
        allData.push(...results);

        if (results.length < limit) {break}
        offset += limit;
    }
    return allData
}


function convertBlob(blob){
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    return a;
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
    getDatastoreQuerySql
}

// let sql = '[SELECT * FROM 11196f15-1a77-5b80-97f3-c46c0ce19894][WHERE state = "Iowa"][OFFSET 11]'
// postDatastoreQuery('ca3ec9ab-7e5f-50e3-88dc-8aca3dbcb598', 'state','virginia').then(r => console.log(r))
// postDatastoreQuery("11196f15-1a77-5b80-97f3-c46c0ce19894", 'state', "Iowa", "=", 1).then(r => console.log(r))
// postDatastoreQueryDownload("11196f15-1a77-5b80-97f3-c46c0ce19894", 'state', "Iowa").then(r => console.log(r))

