// title: '2017 Child and Adult Health Care Quality Measures'
// let s = `Performance rates on frequently reported health care quality measures in the CMS Medicaid/CHIP Child and Adult Core Sets, for FFY 2017 reporting.  Source: Mathematica analysis of MACPro and Form CMS-416 reports for the FFY 2017 reporting cycle. For more information, see the <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/child-core-set/index.html">Children's Health Care Quality Measures</a> and <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/adult-core-set/index.html">Adult Health Care Quality Measures</a> webpages.`
// keyword 'performance rates'
// identifier: 'c1028fdf-2e43-5d5e-990b-51ed03428625' and '53426d8c-82b5-5dec-b44b-0f935b4603e5'

//schema types: dataset, distribution/datastore, keyword, publisher, theme, data-dictionary
import {fetchItems} from '../sdk.js';

//endpoint: "metastore/schemas/";
async function getSchemas(){
    try{
        return await fetchItems("metastore/schemas");
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

//ENDPOINT: "metastore/schemas/{schemaType}

async function getSpecificSchema(schemaName){
    try{
        return fetchItems(`metastore/schemas/${schemaName}`);
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

//ENDPOINT: "metastore/schemas/{schema}/items"
async function getSchemaItems(schemaName){
    try{
        return fetchItems(`metastore/schemas/${schemaName}/items`);
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getAllDbUrls(){
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

async function getItemByTitleName(dbTitle) {
    try{
        const items =  await getSchemaItems("dataset");
        let filteredItems = items.filter(item => item.title.toLocaleUpperCase() === dbTitle.toLocaleUpperCase());
        if (filteredItems.length > 1){
            return filteredItems
        }
        else if (filteredItems.length === 1){
            return filteredItems[0]
        }
        return null;
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}


async function getItemByKeyword(dbKeyword){
    try{
        const items =  await getSchemaItems("dataset");
        return items.filter(item => item.keyword.some(key => key.toLocaleUpperCase() === dbKeyword.toLocaleUpperCase()));
    }catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getItemByDescription(dbDescription) {
    try{
        const items =  await getSchemaItems("dataset");
        return items.filter(item => item.description.toLocaleUpperCase() === dbDescription.toLocaleUpperCase());
    }catch (Error){
        console.log("The request could not be fulfilled.");
    }
}


//endpoint: metastore/schemas/dataset/items/{identifier}
async function getSchemaItemById(schemaName, itemId){
    try {
        return await fetchItems(`metastore/schemas/${schemaName}/items/${itemId}`);

    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getDatasetById(datasetId){
    try {
        return await fetchItems(`metastore/schemas/dataset/items/${datasetId}`);
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}


export {
    getAllDbUrls,
    getItemByTitleName,
    getItemByKeyword,
    getItemByDescription,
    getDatasetById
}

