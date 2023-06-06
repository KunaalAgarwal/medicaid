// let s = `Performance rates on frequently reported health care quality measures in the CMS Medicaid/CHIP Child and Adult Core Sets, for FFY 2017 reporting.  Source: Mathematica analysis of MACPro and Form CMS-416 reports for the FFY 2017 reporting cycle. For more information, see the <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/child-core-set/index.html">Children's Health Care Quality Measures</a> and <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/adult-core-set/index.html">Adult Health Care Quality Measures</a> webpages.`
// medicaidSDK.getItemByDescription(s).then(r => console.log(r[0].title));
// medicaidSDK.getItemByIdentifier('c1028fdf-2e43-5d5e-990b-51ed03428625').then(r => console.log(r[0].title));
// medicaidSDK.getItemByTitleName('2017 Child and Adult Health Care Quality Measures').then(r => console.log(r[0].title));
// medicaidSDK.getItemByKeyword('performance rates').then(r => console.log(r[0].title));

const loadedAt = `Medicaid SDK loaded at \n${Date()}`;
let items = [] // caching

async function fetchItems(){
    if(items.length>0){
        return items // if cached no need to retrieve again
    }else{
        items=await (await fetch('https://data.medicaid.gov/api/1/metastore/schemas/dataset/items')).json()
        console.log(loadedAt);
        return items
    }
}

async function getItemByTitleName(databaseTitle) {
    const items =  await fetchItems();
    return items.filter(item => item.title.toLocaleUpperCase() === databaseTitle.toLocaleUpperCase());
}

async function getItemByKeyword(dbKeyword){
    const items = await fetchItems();
    return items.filter(item => item.keyword.some(key => key.toLocaleUpperCase() === dbKeyword.toLocaleUpperCase()));
}

async function getItemByDescription(dbDescription) {
    const items = await fetchItems();
    return items.filter(item => item.description.toLocaleUpperCase() === dbDescription.toLocaleUpperCase());
}

async function getItemByIdentifier(dbIdentifier) {
    const items = await fetchItems();
    return items.filter(item => item.identifier.toLocaleUpperCase() === dbIdentifier.toLocaleUpperCase());
}

export {
    items,
    fetchItems,
    getItemByTitleName,
    getItemByKeyword,
    getItemByDescription,
    getItemByIdentifier
}

