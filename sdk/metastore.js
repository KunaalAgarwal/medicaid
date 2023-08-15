import {getItems} from './httpMethods.js';

//endpoint: "metastore/schemas/";
async function getSchemas(){
    const response = await getItems("metastore/schemas");
    if (response === undefined){
        throw new Error("Failed to retrieve datasets from the API.");
    }
    return response;
}
const schemas = Object.keys(await getSchemas());
//ENDPOINT: "metastore/schemas/{schemaType}
async function getSpecificSchema(schemaName){
    if (schemaName === undefined || !schemas.includes(schemaName.toLowerCase())){
        throw new Error ("Please enter a valid schema.");
    }
    const response = await getItems(`metastore/schemas/${schemaName.toLowerCase()}`);
    if (response === undefined){
        throw new Error("Failed to retrieve datasets from the API.");
    }
    return response;
}

//ENDPOINT: "metastore/schemas/{schema}/items"
async function getSchemaItems(schemaName){
    if (schemaName === undefined || !schemas.includes(schemaName.toLowerCase())){
        throw new Error ("Please enter a valid schema.");
    }
    let schemaItems = await getItems(`metastore/schemas/${schemaName.toLowerCase()}/items`);
    if (schemaItems === undefined){
        throw new Error("Failed to retrieve schema items from the API.");
    }
    return schemaItems;
}

async function getAllDatasetUrls(){
    const datasets = await getSchemaItems('dataset');
    return datasets.map(dataset => parseDatasetUrl(dataset));
}

function parseDatasetUrl(dataset){
    if (dataset === undefined){
        throw new Error("Please enter a valid dataset to retrieve the parsed download link.")
    }
    return (dataset["distribution"][0])["downloadURL"];
}

async function filterSchemaItems(schemaName, filterFn){
    const items = await getSchemaItems(schemaName);
    const filteredItems = items.filter(filterFn);
    const result = filteredItems.length === 1 ? filteredItems[0] : filteredItems;
    if (result === undefined){
        throw new Error("The datasets could not be filtered.")
    }
    return result;
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
    return await filterSchemaItems("dataset", item => parseDatasetUrl(item) === url);
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
    let dataset = await getDatasetById(datasetId);
    let downloadLink = parseDatasetUrl(dataset);
    let distribution = await getDistributionByDownloadUrl(downloadLink);
    if (distribution === undefined) throw new Error("The dataset Id could not be converted.");
    let adjustedDistribution = Array.isArray(distribution) ? distribution : [distribution];
    return (adjustedDistribution)[0].identifier;
}

async function convertDistributionToDatasetId(distributionId){
    let distribution = await getDistributionById(distributionId);
    let downloadLink = distribution.data["downloadURL"]
    let dataset = await getDatasetByDownloadUrl(downloadLink);
    if (dataset === undefined) throw new Error("The distribution Id could not be converted");
    let adjustedDataset = Array.isArray(dataset) ? dataset : [dataset];
    return (adjustedDataset)[0].identifier;
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
    parseDatasetUrl,
    convertDatasetToDistributionId,
    convertDistributionToDatasetId,
    getDistributionByDownloadUrl,
    getDistributionById
}

