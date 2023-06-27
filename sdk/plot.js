import {getDatastoreQuerySql} from "./sql.js";
import Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';
import {convertDatasetToDistributionId, getDatasetByKeyword} from "./metastore.js";

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
    "bd58d95e-f4b3-5139-b3b8-aabecffde0c9"
]

async function getNadacMeds(){
    //uses the 2017 nadac
    const sql = `[SELECT ndc_description FROM f4ab6cb6-e09c-52ce-97a2-fe276dbff5ff]`;
    const medObjects = await getDatastoreQuerySql(sql);
    const medList = new Set(medObjects.map(med => med.ndc_description.toUpperCase()));
    return Array.from(medList).sort();
}

async function getMedNames(medicine){
    const medList = await getNadacMeds()
    return medList.filter(med => med.includes(`${medicine.toUpperCase()} `))
}

async function getAllDataFromMed(medList,  vars = { xAxis: "as_of_date", yAxis: "nadac_per_unit" }){
    let nadacDatasets = (await getDatasetByKeyword("nadac")).filter(r => r.title.includes("(National Average Drug Acquisition Cost)"));
    let nadacDistributions = await Promise.all(nadacDatasets.map(r => {return convertDatasetToDistributionId(r.identifier)}))
    return await getPlotData(medList ,vars.xAxis ,vars.yAxis, nadacDistributions)
}

async function getPlotData(items, xAxis, yAxis, distributions) {
    try {
        let xValues = [];
        let yValues = [];
        const fetchData = async (identifier, item) => {
            let sql = `[SELECT ndc_description,${xAxis},${yAxis} FROM ${identifier}][WHERE ndc_description = "${item}"]`;
            const data = await getDatastoreQuerySql(sql);
            for (let datapoint of data) {
                xValues.push(datapoint[xAxis]);
                yValues.push(datapoint[yAxis]);
            }
        }

        const fetchDataPromises = [];
        for (let dataset of distributions) {
            items.forEach(item => {
                fetchDataPromises.push(fetchData(dataset, item));
            })
        }
        await Promise.all(fetchDataPromises);
        return {x: xValues.sort(), y: yValues, name: (items[0].split(' '))[0]};
    } catch (error) {
        console.log("Please enter a valid medicine.");
    }
}



async function plotNadacMed(medList, layout, vars){
    if (medList.length < 1){return}
    let data = [];
    for (const med of medList) {
        data.push(await getAllDataFromMed(med, vars))
    }
    return plot(data, layout)
}

function plot(data, layout){
    try{
        const div = document.createElement('div')
        Plotly.newPlot(div, data, layout);
        return div;
    } catch (error){
        console.log("The plot could not be created.")
    }
}

//OBSERVABLE NOTEBOOK RELATED METHODS
async function getSimilarMeds(medList) {
    let allSimMeds = [];
    for (let i of medList) {
        let generalName = i.split(" ")[0];
        let meds = await getMedNames(generalName);
        for (let m of meds) {
            if (allSimMeds.some((med) => med.generalDrug === generalName && med.specificName === m)) {
                allSimMeds.push({
                    generalDrug: `${generalName}2`,
                    specificName: m
                });
            } else {
                allSimMeds.push({
                    generalDrug: generalName,
                    specificName: m
                });
            }
        }
    }
    return allSimMeds;
}

function parseSelectedMeds(medList) {
    return Object.values(medList.reduce((result, obj) => {
        const {generalDrug, specificName} = obj;
        if (generalDrug in result) {
            result[generalDrug].push(specificName);
        } else {
            result[generalDrug] = [specificName];
        }
        return result;
    }, {}));
}

export {
    getNadacMeds,
    getMedNames,
    getAllDataFromMed,
    plotNadacMed,
    getSimilarMeds,
    parseSelectedMeds,
    Plotly
}