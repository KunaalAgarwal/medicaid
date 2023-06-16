// title: '2017 Child and Adult Health Care Quality Measures'
// let s = `Performance rates on frequently reported health care quality measures in the CMS Medicaid/CHIP Child and Adult Core Sets, for FFY 2017 reporting.  Source: Mathematica analysis of MACPro and Form CMS-416 reports for the FFY 2017 reporting cycle. For more information, see the <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/child-core-set/index.html">Children's Health Care Quality Measures</a> and <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/adult-core-set/index.html">Adult Health Care Quality Measures</a> webpages.`
// keyword 'performance rates'
// identifier: 'c1028fdf-2e43-5d5e-990b-51ed03428625' and '53426d8c-82b5-5dec-b44b-0f935b4603e5'

//schema types: dataset, distribution/datastore, keyword, publisher, theme, data-dictionary
import {getItems} from './httpMethods.js';

//endpoint: "metastore/schemas/";
async function getSchemas(){
    try{
        return await getItems("metastore/schemas");
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

//ENDPOINT: "metastore/schemas/{schemaType}

async function getSpecificSchema(schemaName){
    try{
        return getItems(`metastore/schemas/${schemaName}`);
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

//ENDPOINT: "metastore/schemas/{schema}/items"
async function getSchemaItems(schemaName){
    try{
        return getItems(`metastore/schemas/${schemaName}/items`);
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getAllDatasetUrls(){
    let urlArray = [];
    try{
        for (let dbItem of Object.values(await getSchemaItems("dataset").then())){
            urlArray.push(parseDownloadLink(dbItem));
        }
        return urlArray;
    }catch(Error){
        console.log("The request could not be fulfilled");
    }
}

function parseDownloadLink(dataset){
    return (dataset.distribution[0]).downloadURL;
}
async function getDatasetByTitleName(datasetTitle) {
    try{
        const items =  await getSchemaItems("dataset");
        let filteredItems = items.filter(item => item.title.toLocaleUpperCase() === datasetTitle.toLocaleUpperCase());
        if (filteredItems.length > 1){
            return filteredItems;
        }
        else if (filteredItems.length === 1){
            return filteredItems[0];
        }
        return null;
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getDatasetByKeyword(datasetKeyword){
    try{
        const items =  await getSchemaItems("dataset");
        let filteredItems = items.filter(item => item.keyword.some(key => key.toLocaleUpperCase() === datasetKeyword.toLocaleUpperCase()));
        if (filteredItems.length > 1){
            return filteredItems;
        }
        else if (filteredItems.length === 1){
            return filteredItems[0]
        }
        return null;
    }catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getDatasetByDescription(datasetDescription) {
    try{
        const items =  await getSchemaItems("dataset");
        let filteredItems = items.filter(item => item.description.toLocaleUpperCase() === datasetDescription.toLocaleUpperCase());
        if (filteredItems.length > 1){
            return filteredItems;
        }
        else if (filteredItems.length === 1){
            return filteredItems[0];
        }
        return null;
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getDatasetByDownloadUrl(url){
    try{
        const items =  await getSchemaItems("dataset");
        let filteredItems = items.filter(item => parseDownloadLink(item) === url);
        if (filteredItems.length > 1){
            return filteredItems;
        }
        else if (filteredItems.length === 1){
            return filteredItems[0];
        }
        return null;
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getDistributionByDownloadUrl(url){
    try{
        const items =  await getSchemaItems("distribution");
        let filteredItems = items.filter(item => item.data.downloadURL === url);
        if (filteredItems.length > 1){
            return filteredItems;
        }
        else if (filteredItems.length === 1){
            return filteredItems[0];
        }
        return null;
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}


//endpoint: metastore/schemas/{schema}/items/{identifier}
async function getSchemaItemById(schemaName, itemId){
    try {
        return await getItems(`metastore/schemas/${schemaName}/items/${itemId}`);

    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getDatasetById(datasetId){
    try {
        return await getSchemaItemById('dataset', datasetId);
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}
async function getDistributionById(distributionId){
    try {
        return await getSchemaItemById('distribution', distributionId)
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function convertDatasetToDistributionId(datasetId) {
    let dataset = await getDatasetById(datasetId);
    let downloadLink = parseDownloadLink(dataset);
    return (await getDistributionByDownloadUrl(downloadLink)).identifier;
}

async function convertDistributionToDatasetId(distributionId){
    let distribution = await getDistributionById(distributionId);
    let downloadLink = distribution.data.downloadURL
    return (await getDatasetByDownloadUrl(downloadLink)).identifier
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

