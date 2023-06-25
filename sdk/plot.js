import {getDatastoreQuerySql} from "./sql.js";
import Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';

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

async function getAllNadacMeds(){
    //uses the 2017 nadac
    let sql = `[SELECT ndc_description FROM f4ab6cb6-e09c-52ce-97a2-fe276dbff5ff]`
    const medObjects = await getDatastoreQuerySql(sql);
    let medList = {}
    medObjects.forEach(med => {medList[med.ndc_description.toUpperCase()] = 1})
    return Object.keys(medList)
}

async function getMedNames(medicine){
    const medList = await getAllNadacMeds()
    return medList.filter(med => med.includes(`${medicine.toUpperCase()} `))
}

async function getAllDataFromMed(med, vars = { xAxis: "as_of_date", yAxis: "nadac_per_unit" }) {
    try {
        const meds = await getMedNames(med);
        let xValues = [];
        let yValues = [];
        const fetchData = async (dataset, med) => {
            let sql = `[SELECT ndc_description,${vars.xAxis},${vars.yAxis} FROM ${dataset}][WHERE ndc_description = "${med}"]`;
            const data = await getDatastoreQuerySql(sql);
            for (let datapoint of data) {
                xValues.push(datapoint[vars.xAxis]);
                yValues.push(datapoint[vars.yAxis]);
            }
        }
        const fetchDataPromises = [];
        for (let dataset of nadacDistributions) {
            for (let med of meds) {
                fetchDataPromises.push(fetchData(dataset, med));
            }
        }
        await Promise.all(fetchDataPromises);
        return {x: xValues.sort(), y: yValues, name: med };
    } catch (error) {
        console.log("There was an error collecting the data.");
    }
}

async function plotPriceVersusTime(medList, layout){
    let data = [];
    if (medList < 1) {
        return;
    }
    for (const med of medList) {
        data.push(await getAllDataFromMed(med))
    }
    const plot = document.createElement('div');
    Plotly.newPlot(plot, data, layout)
    return plot;
}

export {
    getAllNadacMeds,
    getMedNames,
    getAllDataFromMed,
    plotPriceVersusTime,
    Plotly
}