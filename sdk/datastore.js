//'11196f15-1a77-5b80-97f3-c46c0ce19894'
//'d5eaf378-dcef-5779-83de-acdd8347d68e' nadac
//datastore = distribution

//https://data.medicaid.gov/api/1/datastore/imports/ {distribution id}
import {getItems, postItem, postDownloadableItem} from '../sdk.js';

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
        return await postDownloadableItem('datastore/query/download', requestBody, headers);
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
            for (let i = 0; i < 10; i++) { // Adjust the number of parallel requests as needed
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
        let response = await postItem('datastore/query', requestBody, headers);
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
            for (let i = 0; i < 10; i++) { // Adjust the number of parallel requests as needed
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

async function getDatastoreQuerySql(sqlQuery, showColumnFlag = true){
    //format sql as: '[SELECT * FROM datastore_id][WHERE columnName = "value"][LIMIT value OFFSET value]'
    try{
        const allData = [];
        let endpoint = `datastore/sql?query=${sqlQuery};&show_db_columns=true`

        if (!showColumnFlag){
            endpoint = `datastore/sql?query=${sqlQuery}`;
        }
        if (!sqlQuery.includes("LIMIT")){
            let limit = 10000;
            let offset = 0;
            while(true) {
                const results = await getItems(endpoint)
                allData.push(...results);
                if (results.length < limit){
                    break;
                }
                offset += limit;
            }
            return allData;
        }

        return await getItems(endpoint);
    }catch(Error){
        console.log("The request could not be fulfilled");
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
    getDatastoreQuerySql
}