//'11196f15-1a77-5b80-97f3-c46c0ce19894'
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
async function getDatastoreQueryDistributionId(distributionId, limit = 0, offset = 0){
    //offset is starting index, if limit is zero then having an offset will lead to a null array
    try{
        let items = await getItems(`datastore/query/${distributionId}?limit=${limit}&offset=${offset}`);
        return items.results;
    } catch (Error){
        console.log("The request could not be fulfilled.");
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
    // try{
        let response = await postItem(`datastore/query/${datasetId}/0`, requestBody, headers);
        return response.results;
    // }catch (Error){
    //     console.log("The post could not be fulfilled.");
    // }
}

async function getDatastoreQueryDatasetId(datasetId, limit=0, offset=0){
    try{
        let items = await getItems(`datastore/query/${datasetId}/${0}?limit=${limit}&offset=${offset}`);
        return items.results;
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getAllDataFromDataset(datasetId){
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

function setSqlQuery(datastoreId, columnName, columnValue, limit, offset){
    // [SELECT * FROM id][WHERE columnName = "columnValue"][LIMIT x OFFSET y];
    let baseQuery = `[SELECT * FROM ${datastoreId}]`;
    if (columnValue != null && columnName != null){
        baseQuery += `[WHERE ${columnName} = "${columnValue}"]`;
    }
    if (limit !== null && offset !== null){
        baseQuery += `[LIMIT ${limit} OFFSET ${offset}]`;
    }
    else if (limit !== null){
        baseQuery += `[LIMIT ${limit}]`
    }
    return baseQuery;
}
async function getDatastoreQuerySql(id, columnName= null, columnValue = null, limit= null, offset = null){
    try{
        let sqlQuery = setSqlQuery(id, columnName, columnValue, limit, offset);
        return await getItems(`datastore/sql?query=${sqlQuery};&show_db_columns=true`);
    }catch(Error){
        console.log("The request could not be fulfilled");
    }
}
// getDatastoreQuerySql('11196f15-1a77-5b80-97f3-c46c0ce19894', null, null, 3).then(r => console.log(r));

export{
    getDatastoreImport,
    postDatastoreQuery,
    postDatastoreQueryDownload,
    postDatastoreQueryDistributionId,
    postDatastoreQueryDatasetId,
    getDatastoreQueryDistributionId,
    getDatastoreQueryDatasetId,
    getAllDataFromDataset,
    getDownloadByDistributionId,
    getDownloadByDatasetId,
    getDatastoreQuerySql
}