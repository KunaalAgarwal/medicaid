import {getDatastoreQuerySql} from "./sql.js";
import {convertDatasetToDistributionId, getDatasetByKeyword} from "./metastore.js";
import Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';

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
    return plot(data, layout);
}

function plot(data, layout, type = "line"){
    try{
        const div = document.createElement('div');
        for (let trace of data){
            trace.type = type;
        }
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
    getPlotData,
    plot,
    Plotly
}