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
        let limit;
        const allData = [];
        let offset = 0;
        if (sqlQuery.includes("OFFSET")){
            offset = parseInt(sqlQuery.split("OFFSET")[1].trimStart().split("]")[0])
        }
        if (sql.includes("LIMIT")){
            limit = parseInt((sqlQuery.split("LIMIT")[1].trimStart().split(" ")[0]).split("]")[0])
            if (limit <= 10000){
                return await getItems(baseEndpoint);
            } else {
                while (limit > 0) {
                    let currentLimit = Math.min(limit, 10000);
                    let queryWithLimitOffset;
                    if (sqlQuery.includes("OFFSET")){
                        queryWithLimitOffset = sqlQuery.replace(/\[LIMIT \d+/, `[LIMIT ${currentLimit}`).replace(/\[OFFSET \d+\]/, `[OFFSET ${offset}]`);
                    } else {
                        queryWithLimitOffset = sqlQuery.replace(/\[LIMIT \d+/, `[LIMIT ${currentLimit}`)
                    }
                    baseEndpoint = `datastore/sql?query=${queryWithLimitOffset}&show_db_columns=${showColumnFlag}`;
                    const results = await getItems(baseEndpoint);
                    allData.push(...results);
                    offset += currentLimit;
                    limit -= currentLimit;
                }
                return allData;
            }
        }

        limit = 10000;
        while (true) {
            let queryWithLimitOffset;
            if (sqlQuery.includes("OFFSET")){
                queryWithLimitOffset = sqlQuery.replace(/OFFSET \d+\]/, `LIMIT ${limit} OFFSET ${offset}]`);
            }
            else {
                queryWithLimitOffset = `${sqlQuery}[LIMIT ${limit} OFFSET ${offset}]`;
            }
            baseEndpoint = `datastore/sql?query=${queryWithLimitOffset}&show_db_columns=${showColumnFlag}`;
            const results = await getItems(baseEndpoint);
            allData.push(...results);
            if (results.length < limit) {
                break;
            }
            offset += limit;
        }
        return allData;
    } catch (Error) {
        console.log("The request could not be fulfilled");
    }
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

