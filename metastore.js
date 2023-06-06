// title: '2017 Child and Adult Health Care Quality Measures'
// let s = `Performance rates on frequently reported health care quality measures in the CMS Medicaid/CHIP Child and Adult Core Sets, for FFY 2017 reporting.  Source: Mathematica analysis of MACPro and Form CMS-416 reports for the FFY 2017 reporting cycle. For more information, see the <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/child-core-set/index.html">Children's Health Care Quality Measures</a> and <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/adult-core-set/index.html">Adult Health Care Quality Measures</a> webpages.`
// keyword 'performance rates'
// identifier: 'c1028fdf-2e43-5d5e-990b-51ed03428625' and '53426d8c-82b5-5dec-b44b-0f935b4603e5'
import {fetchItems} from './sdk.js';

//endpoint returns all databases and some metadata

async function getAllItems(){
    try{
        return await fetchItems("metastore/schemas/dataset/items");
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getItemByTitleName(databaseTitle) {
    try{
        const items =  await fetchItems("metastore/schemas/dataset/items");
        return items.filter(item => item.title.toLocaleUpperCase() === databaseTitle.toLocaleUpperCase());
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }

}

async function getItemByKeyword(dbKeyword){
    try{
        const items =  await fetchItems("metastore/schemas/dataset/items");
        return items.filter(item => item.keyword.some(key => key.toLocaleUpperCase() === dbKeyword.toLocaleUpperCase()));
    }catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function getItemByDescription(dbDescription) {
    try{
        const items =  await fetchItems("metastore/schemas/dataset/items");
        return items.filter(item => item.description.toLocaleUpperCase() === dbDescription.toLocaleUpperCase());
    }catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

async function filterItemsByIdentifier(dbIdentifier) {
    try{
        const items =  await fetchItems("metastore/schemas/dataset/items");
        return items.filter(item => item.identifier.toLocaleUpperCase() === dbIdentifier.toLocaleUpperCase());
    }catch (Error){
        console.log("The request could not be fulfilled.");
    }
}


//endpoint is directly at a single database
async function getItemByIdentifier(dbIdentifier){
    try {
        return await fetchItems("metastore/schemas/dataset/items/" + dbIdentifier);
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}
async function getItemTitle(identifier){
    return (await getItemByIdentifier(identifier)).title;
}

async function getItemDownloadLink(identifier){
    let distributionJson = (await getItemByIdentifier(identifier)).distribution
    return distributionJson[0].downloadURL;
}

export {
    getItemByTitleName,
    getItemByKeyword,
    getItemByDescription,
    getItemByIdentifier,
    filterItemsByIdentifier
}

getItemTitle('c1028fdf-2e43-5d5e-990b-51ed03428625').then(r => console.log(r));
getItemDownloadLink('c1028fdf-2e43-5d5e-990b-51ed03428625').then(r => console.log(r));


// getAllItems().then(r => console.log(r));

// getItemByIdentifier('c1028fdf-2e43-5d5e-990b-51ed03428625').then(r => console.log(r));
// getItemByIdentifier('c1028fdf-2e43-5d5e-990b-51ed03428625').then(r => console.log(r));
//
// filterItemsByIdentifier('c1028fdf-2e43-5d5e-990b-51ed03428625').then(r => console.log(r));
// getItemByTitleName('2017 Child and Adult Health Care Quality Measures').then(r => console.log(r));
