import {getDatastoreQuerySql} from "./sql.js";
import {convertDatasetToDistributionId, getDatasetByKeyword} from "./metastore.js";
import Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';

//NADAC Related
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

async function getAllDataFromMed(medList,  vars = {xAxis: "as_of_date", yAxis: "nadac_per_unit"}){
    let nadacDatasets = (await getDatasetByKeyword("nadac")).filter(r => r.title.includes("(National Average Drug Acquisition Cost)"));
    let nadacDistributions = await Promise.all(nadacDatasets.map(r => {return convertDatasetToDistributionId(r.identifier)}))
    return await getPlotData(medList, {xAxis: vars.xAxis, yAxis: vars.yAxis, filter: "ndc_description"}, nadacDistributions)
}

async function plotNadacMed(medList, layout, vars) {
    const medListOutput = Array.isArray(medList) ? medList : [medList];
    if (medListOutput.length === 0) return;
    const data = await Promise.all(medListOutput.map(async (med) => {
        if (typeof med === "string") {
            return await getAllDataFromMed([med], vars);
        } else {
            return await getAllDataFromMed(med, vars);
        }
    }));
    return plot(data, layout, "line");
}

//ADULT AND CHILD HEALTH CARE QUALITY MEASURES

async function getStateMeasureData(items, measureName, distributions){
    let datasets = await getDatasetByKeyword("performance rates");
    let distributionIds = await Promise.all(datasets.map(x => {return convertDatasetToDistributionId(x.title)}))
    return await getPlotData(items, {xAxis: 'ffy', yAxis: "state_rate", filter: "state", })
}

//GENERAL
function plot(data, layout, type = "line"){
    try{
        const div = document.createElement('div');
        for (let trace of data){trace.type = type;}
        Plotly.newPlot(div, data, layout);
        return div;
    } catch (error){
        console.log("The plot could not be created.")
    }
}

async function getPlotData(items, vars, distributions) {
    try{
        const xValues = [];
        const yValues = [];
        const data = await getAllData(items, vars, distributions);
        data.forEach(datapoint => {
            xValues.push(datapoint[vars.xAxis]);
            yValues.push(datapoint[vars.yAxis]);
        })
        return {x: xValues.sort(), y: yValues, name: (items[0].split(' '))[0]}
    } catch(error){
        console.log("An error occurred in data collection.")
    }
}

async function getAllData(items, vars, distributions){
    let varsString = ""
    const fetchDataPromises = [];
    Object.values(vars).forEach(v => {varsString += `,${v}`})
    varsString = varsString.slice(1, varsString.length)
    const fetchData = async (identifier, item) => {
        let sql = `[SELECT ${varsString} FROM ${identifier}][WHERE ${vars.filter} = "${item}"]`;
        return await getDatastoreQuerySql(sql);
    }
    for (let dataset of distributions) {
        items.forEach(item => {
            fetchDataPromises.push(fetchData(dataset, item));
        })
    }
    return (await Promise.all(fetchDataPromises)).flat();
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
    getPlotData,
    plot,
    Plotly
}