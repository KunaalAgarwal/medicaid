import {getDatastoreQuerySql} from "./sql.js";

let nadacDistributions = [
    "37ad62a2-f107-5ec9-b168-000694b6b8b9",
    "92d88e07-d0c0-54c7-bb2c-a1093f28b5de",
    "ac6a5a27-f625-5247-a6e3-a0b8ddfae7fd",
    "3b54f1b4-1bae-5d03-8036-dbb5c7120428",
    "f4ab6cb6-e09c-52ce-97a2-fe276dbff5ff",
    "94749796-fa79-507c-a622-e724ef63bec2",
    "135a02e5-1885-5585-8b46-4094a83cc16f",
    "c961ae91-bf7a-5ab6-98f4-f84ee765c71c",
    "88b0eac5-6164-5737-b746-16eaefd52664",
    "99cac002-f9d9-565b-b23a-7e9be602ba74",
    "c5be50a1-0b23-5fcf-8b82-da7189b60e92"
]

async function getAllMedNames(){
    //uses the 2017 nadac
    let sql = `[SELECT ndc_description FROM f4ab6cb6-e09c-52ce-97a2-fe276dbff5ff]`
    return await getDatastoreQuerySql(sql);
}

async function getMedNames(medicine){
    const medList = await getAllMedNames()
    let medNames = {};
    medList.forEach(med => {
        med = med.ndc_description.toUpperCase();
        if (med.includes(medicine.toUpperCase())){
            medNames[med] = "1";
        }})
    return Object.keys(medNames);
}

async function getAllDataFromMed(med){
    const meds = await getMedNames(med)
    console.log(meds);
    let asOfDates = [];
    let ndcPerUnit = [];
    for (let dataset of nadacDistributions){
        for (let med of meds){
            let sql = `[SELECT ndc_description,as_of_date,nadac_per_unit FROM ${dataset}][WHERE ndc_description = "${med}"]`
            const data = await getDatastoreQuerySql(sql);
            for (let datapoint of data){
                asOfDates.push(datapoint.as_of_date);
                ndcPerUnit.push(datapoint.nadac_per_unit);
            }
        }
    }
    return [{x: asOfDates, y: ndcPerUnit}]
}

async function createPlot(med, layout, width){
    const plot = document.createElement('a');
    const traces = getAllDataFromMed(med);
    Plotly.newPlot(plot, traces, layout, {width: width})
}

export {
    getMedNames,
    getAllDataFromMed,
    createPlot
}

// async function a(){
//     let totalItems = []
//     for (let id of nadac_2013_2023_distributionIds){
//         let sql = `[SELECT ndc_description FROM ${id}][WHERE ndc_description = "LANTUS 100 UNIT/ML"]`
//         const items = await sdk.getDatastoreQuerySql(sql);
//         totalItems.push(...items);
//     }
//     return totalItems
// }