// title: '2017 Child and Adult Health Care Quality Measures'
// let s = `Performance rates on frequently reported health care quality measures in the CMS Medicaid/CHIP Child and Adult Core Sets, for FFY 2017 reporting.  Source: Mathematica analysis of MACPro and Form CMS-416 reports for the FFY 2017 reporting cycle. For more information, see the <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/child-core-set/index.html">Children's Health Care Quality Measures</a> and <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/adult-core-set/index.html">Adult Health Care Quality Measures</a> webpages.`
// keyword 'performance rates'
// identifier: 'c1028fdf-2e43-5d5e-990b-51ed03428625'

const loadedAt = `Medicaid SDK loaded at \n${Date()}`;
let itemsPromise = null; // caching

async function fetchItems() {
    if (itemsPromise !== null) {
        return itemsPromise;
    } else {
        itemsPromise = fetch('https://data.medicaid.gov/api/1/metastore/schemas/dataset/items')
            .then((response) => response.json())
            .catch((error) => {
                itemsPromise = null; // Reset the promise if an error occurs
                throw error;
            });

        console.log(loadedAt);
        return itemsPromise;
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
    fetchItems,
    getItemByTitleName,
    getItemByKeyword,
    getItemByDescription,
    getItemByIdentifier
}

// getItemByIdentifier('c1028fdf-2e43-5d5e-990b-51ed03428625').then(r => console.log(r));
// getItemByIdentifier('c1028fdf-2e43-5d5e-990b-51ed03428625').then(r => console.log(r));

