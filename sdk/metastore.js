import {getItems} from './httpMethods.js';
//endpoint: "metastore/schemas/";
async function getSchemas(){
    const response = await getItems("metastore/schemas");
    if (response === undefined){
        throw new Error("Failed to retrieve datasets from the API.");
    }
    return response;
}

//ENDPOINT: "metastore/schemas/{schemaType}
async function getSpecificSchema(schemaName){
    const response = await getItems(`metastore/schemas/${schemaName.toLowerCase()}`);
    if (response === undefined){
        throw new Error("Failed to retrieve datasets from the API.");
    }
    return response;
}

//ENDPOINT: "metastore/schemas/{schema}/items"
async function getSchemaItems(schemaName){
    let schemaItems = await getItems(`metastore/schemas/${schemaName.toLowerCase()}/items`);
    if (schemaItems === undefined){
        throw new Error("Failed to retrieve schema items from the API.");
    }
    return schemaItems;
}

async function getAllDatasetUrls(){
    const datasets = await getSchemaItems('dataset');
    return Object.values(datasets).map(dataset => parseDownloadLink(dataset));
}

function parseDownloadLink(dataset){
    if (dataset === undefined){
        throw new Error("The dataset has not been defined and cannot be parsed.")
    }
    return (dataset["distribution"][0])["downloadURL"];
}
async function filterSchemaItems(schemaName, filterFn){
    try{
        const items = await getSchemaItems(schemaName);
        const filteredItems = items.filter(filterFn);
        return filteredItems.length === 1 ? filteredItems[0] : filteredItems;
    }catch (error) {
        console.log("The datasets could not be filtered.")
    }
}
async function getDatasetByTitleName(datasetTitle) {
    return await filterSchemaItems("dataset", item => item.title.toUpperCase() === datasetTitle.toUpperCase());
}

async function getDatasetByKeyword(datasetKeyword){
    return await filterSchemaItems("dataset", item => item["keyword"].some(key => key.toUpperCase() === datasetKeyword.toUpperCase()));
}

async function getDatasetByDescription(datasetDescription) {
    return await filterSchemaItems("dataset", item => item.description.toUpperCase() === datasetDescription.toUpperCase());
}

async function getDatasetByDownloadUrl(url){
    return await filterSchemaItems("dataset", item => parseDownloadLink(item) === url);
}

async function getDistributionByDownloadUrl(url){
    return await filterSchemaItems("distribution", item => item.data["downloadURL"] === url);
}

//endpoint: metastore/schemas/{schema}/items/{identifier}
async function getSchemaItemById(schemaName, itemId){
    const response = await getItems(`metastore/schemas/${schemaName.toLowerCase()}/items/${itemId}`);
    if (response === undefined){
        throw new Error ("The item could not be retrieved by its ID.");
    }
    return response;
}

async function getDatasetById(datasetId){
    return await getSchemaItemById("dataset", datasetId);
}

async function getDistributionById(distributionId){
    return await getSchemaItemById("distribution", distributionId);
}

async function convertDatasetToDistributionId(datasetId) {
    try{
        let dataset = await getDatasetById(datasetId);
        let downloadLink = parseDownloadLink(dataset);
        let distribution = await getDistributionByDownloadUrl(downloadLink);
        let adjustedDistribution = Array.isArray(distribution) ? distribution : [distribution];
        return (adjustedDistribution)[0].identifier;
    } catch (error){
        console.log("Could not convert the id.");
    }
}

async function convertDistributionToDatasetId(distributionId){
    try{
        let distribution = await getDistributionById(distributionId);
        let downloadLink = distribution.data["downloadURL"]
        let dataset = await getDatasetByDownloadUrl(downloadLink);
        let adjustedDataset = Array.isArray(dataset) ? dataset : [dataset];
        return (adjustedDataset)[0].identifier
    } catch (error){
        console.log("Could not convert the id.")
    }
}

export {
    getSchemas,
    getSpecificSchema,
    getSchemaItems,
    getAllDatasetUrls,
    getDatasetByTitleName,
    getDatasetByKeyword,
    getDatasetByDescription,
    getSchemaItemById,
    getDatasetById,
    getDatasetByDownloadUrl,
    parseDownloadLink,
    convertDatasetToDistributionId,
    convertDistributionToDatasetId,
    getDistributionByDownloadUrl,
    getDistributionById
}

