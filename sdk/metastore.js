import {getItems} from './httpMethods.js';
//endpoint: "metastore/schemas/";
async function getSchemas(){
    return await getItems("metastore/schemas");
}

//ENDPOINT: "metastore/schemas/{schemaType}
async function getSpecificSchema(schemaName){
    return await getItems(`metastore/schemas/${schemaName}`);
}

//ENDPOINT: "metastore/schemas/{schema}/items"
async function getSchemaItems(schemaName){
    return await getItems(`metastore/schemas/${schemaName}/items`);
}

async function getAllDatasetUrls(){
    let urlArray = [];
    try{
        Object.values(await getSchemaItems('dataset')).forEach(dataset => {
            urlArray.push(parseDownloadLink(dataset));
        })
        return urlArray;
    }catch(error){
        console.log("The request could not be fulfilled");
    }
}

function parseDownloadLink(dataset){
    return (dataset["distribution"][0])["downloadURL"];
}
async function getDatasetByTitleName(datasetTitle) {
    try{
        const items =  await getSchemaItems("dataset");
        const filteredItems = items.filter(item => item.title.toUpperCase() === datasetTitle.toUpperCase());
        if (filteredItems.length === 1){
            return filteredItems[0];
        }
        return filteredItems;
    } catch (error){
        console.log("The request could not be fulfilled.");
    }
}

async function getDatasetByKeyword(datasetKeyword){
    try{
        const items =  await getSchemaItems("dataset");
        const filteredItems = items.filter(item => item["keyword"].some(key => key.toUpperCase() === datasetKeyword.toUpperCase()));
        if (filteredItems.length === 1){
            return filteredItems[0];
        }
        return filteredItems
    }catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getDatasetByDescription(datasetDescription) {
    try{
        const items =  await getSchemaItems("dataset");
        const filteredItems = items.filter(item => item.description.toUpperCase() === datasetDescription.toUpperCase());
        if (filteredItems.length === 1){
            return filteredItems[0];
        }
        return filteredItems;
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getDatasetByDownloadUrl(url){
    try{
        const items =  await getSchemaItems("dataset");
        const filteredItems = items.filter(item => parseDownloadLink(item) === url);
        if (filteredItems.length === 1){
            return filteredItems[0];
        }
        return filteredItems;
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getDistributionByDownloadUrl(url){
    try{
        const items =  await getSchemaItems("distribution");
        const filteredItems = items.filter(item => item.data["downloadURL"] === url);
        if (filteredItems.length === 1){
            return filteredItems[0]
        }
        return filteredItems
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

//endpoint: metastore/schemas/{schema}/items/{identifier}
async function getSchemaItemById(schemaName, itemId){
    return await getItems(`metastore/schemas/${schemaName}/items/${itemId}`);
}

async function getDatasetById(datasetId){
    return await getSchemaItemById('dataset', datasetId);
}

async function getDistributionById(distributionId){
    return await getSchemaItemById('distribution', distributionId)
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

