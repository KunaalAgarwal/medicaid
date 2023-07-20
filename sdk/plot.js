import {getDatastoreQuerySql} from "./sql.js";
import {convertDatasetToDistributionId, getDatasetByKeyword, getDatasetByTitleName} from "./metastore.js";
import Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';

//NADAC Related
async function getNadacMeds(){
    //uses the 2017 nadac
    const sql = `[SELECT ndc_description FROM f4ab6cb6-e09c-52ce-97a2-fe276dbff5ff]`;
    const medObjects = await getDatastoreQuerySql(sql);
    const medList = new Set(medObjects.map(med => med["ndc_description"]));
    return Array.from(medList).sort();
}

async function getNdcFromMed(med){
    const sql = `[SELECT ndc_description,ndc FROM f4ab6cb6-e09c-52ce-97a2-fe276dbff5ff][WHERE ndc_description = "${med}"][LIMIT 1]`;
    const response = await getDatastoreQuerySql(sql);
    return response[0]["ndc"]
}

async function getMedNames(medicine){
    const baseMedName = medicine.split(" ")[0];
    const medList = await getNadacMeds()
    return medList.filter(med => med.split(' ')[0] === `${baseMedName.toUpperCase()}`)
}

async function getMedData(meds, filter = "ndc_description", dataVariables = ["as_of_date", "nadac_per_unit"]){
    let nadacDatasets = (await getDatasetByKeyword("nadac")).filter(r => r.title.includes("(National Average Drug Acquisition Cost)"))
    let nadacDistributions = await Promise.all(nadacDatasets.map(r => {return convertDatasetToDistributionId(r.identifier)}))
    const rawData = await getAllData(meds, filter, nadacDistributions, dataVariables);
    return rawData.flat()
}

async function getMedDataPlot(meds, axis = {xAxis: "as_of_date", yAxis: "nadac_per_unit"}){
    const medList = Array.isArray(meds) ? meds : [meds];
    const medData = await getMedData(medList, "ndc_description", Object.values(axis));
    const result = medData.reduce(
        (result, obj) => {
            result.x.push(obj[axis.xAxis])
            result.y.push(obj[axis.yAxis])
            return result
        },
        {x: [], y: []}
    );
    result["x"].sort();
    result["name"] = medList[0];
    return result;
}

async function plotNadacMed(meds, layout, div, axis) {
    if (meds === undefined){
        return;
    }
    const medList = Array.isArray(meds) ? meds : [meds];
    const data = await Promise.all(medList.map(med => getMedDataPlot(med, axis)))
    return plot(data, layout, "line", div);
}

async function getDrugUtilData(meds, filter = "ndc", dataVariables = ["year", "total_amount_reimbursed", "number_of_prescriptions", "suppression_used"]) {
    //retrieving distribution ids and converting medicine names into ndc ids
    const adjustedMedList = Array.isArray(meds) ? meds : [meds];
    const ndcList = await Promise.all(adjustedMedList.map(async med => await getNdcFromMed(med)));
    const drugUtilDatasets = (await getDatasetByKeyword("drug utilization")).slice(22); //only need datasets from 2013 onwards
    const drugUtilIds = await Promise.all(drugUtilDatasets.map(async dataset => await convertDatasetToDistributionId(dataset.identifier)));

    if (!dataVariables.includes("suppression_used")) {
        dataVariables.push("suppression_used");
    }
    //processing and returning data
    const rawData = await getAllData(ndcList, filter, drugUtilIds, dataVariables);
    const results = [];
    for (const datapoint of rawData.flat()) {
        const { suppression_used, ...rest } = datapoint;
        if (suppression_used === "false") {
            results.push(rest);
        }
    }
    return results;
}


//ADULT AND CHILD HEALTH CARE QUALITY MEASURES
async function getHealthcareQualityData(qualityMeasure){
    let dataset = await getDatasetByTitleName("2020 Child and Adult Health Care Quality Measures Quality");
    let distributionId = await convertDatasetToDistributionId(dataset.identifier)
    return await getDatastoreQuerySql(`[SELECT * FROM ${distributionId}][WHERE measure_name === "${qualityMeasure}"]`)
}

async function getQualityMeasures(){
    let dataset = await getDatasetByTitleName("2020 Child and Adult Health Care Quality Measures Quality");
    let distributionId = await convertDatasetToDistributionId(dataset.identifier)
    let measureObjects = await getDatastoreQuerySql(`[SELECT measure_name FROM ${distributionId}]`)
    return new Set(measureObjects.map(measure => measure["measure_name"]));
}

async function getRateDefinitions(qualityMeasure){
    return new Set((await getHealthcareQualityData(qualityMeasure)).map(x => x["rate_definition"]));
}

async function getStates(rateDef, qualityMeasure){
    let filteredData = (await getHealthcareQualityData(qualityMeasure)).filter(x => x["rate_definition"] === rateDef)
    return new Set(filteredData.map(x => {return x.state}));
}

async function getRateBarData(rateDef, qualityMeasure){
    let filteredData = (await getHealthcareQualityData(qualityMeasure)).filter(x => x["rate_definition"] === rateDef)
    let averagedData = averageValues(filteredData.map(x => ({[x.state]: x["state_rate"]})));
    return {x: Object.keys(averagedData), y: Object.values(averagedData), name: `2022: ${rateDef}`}
}
async function getRateTimeSeriesData(states, rateDef) {
    const stateList = Array.isArray(states) ? states : [states];
    const datasets = await getDatasetByKeyword("performance rates");
    const filteredDatasets = datasets.filter(dataset => dataset.title.split(" ")[0] > 2015);
    const distributionIds = await Promise.all(filteredDatasets.map(x => convertDatasetToDistributionId(x.identifier)));
    const rawData = await getAllData(stateList, "state", distributionIds, ["ffy", "state_rate", "rate_definition"]);
    const { xValues, yValues } = rawData.reduce(
        (result, dataset) => {
            const data = dataset.filter(x => x["rate_definition"] === rateDef);
            if (data.length > 0) {
                const sum = data.reduce((total, datapoint) => total + datapoint["state_rate"], 0);
                result.xValues.push(data[0]["ffy"]);
                result.yValues.push(sum / data.length);
            }
            return result;
        },
        { xValues: [], yValues: [] }
    );
    return { x: xValues.sort(), y: yValues, name: stateList[0] };
}

async function plotRateBar(rateDef, qualityMeasure, layout, div){
    const data = await getRateBarData(rateDef, qualityMeasure);
    return plot(data, layout, "bar", div)
}

async function plotRateTimeSeries(stateList, layout, rateDef, div) {
    const states = Array.isArray(stateList) ? stateList : [stateList];
    if (states.length === 0) return;
    const data = await Promise.all(states.map(async (state) => {
        if (typeof state === "string") {
            return await getRateTimeSeriesData([state], rateDef);
        } else {
            return await getRateTimeSeriesData(state, rateDef);
        }
    }));
    return plot(data, layout, "line", div);
}

//GENERAL
function plot(data, layout, type = "line", divElement = null){
    try{
        const adjustedData = Array.isArray(data) ? data : [data];
        const div = divElement || document.createElement('div');
        for (let trace of adjustedData){trace.type = type}
        Plotly.newPlot(div, adjustedData, layout);
        return div;
    } catch (error){
        console.log("The plot could not be created.")
    }
}
async function getAllData(items, filter, distributions, dataVariables){
    try{
        if (items === undefined){
            return;
        }
        const itemsArray =  Array.isArray(items) ? items : [items];
        const varsString = dataVariables.join(',')
        const fetchDataPromises = [];
        const fetchData = async (identifier, item) => {
            let sql = `[SELECT ${varsString} FROM ${identifier}][WHERE ${filter} = "${item}"]`;
            return await getDatastoreQuerySql(sql);
        }
        for (let distributionId of distributions) {
            itemsArray.forEach(item => {
                fetchDataPromises.push(fetchData(distributionId, item));
            })
        }
        return await Promise.all(fetchDataPromises);
    } catch (error){
        console.log("An error occurred in getAllData()" + error);
    }
}

//OBSERVABLE NOTEBOOK RELATED METHODS
async function getSimilarMeds(medList) {
    let allSimMeds = [];
    for (let i of medList) {
        let meds = await getMedNames(i);
        for (let m of meds) {
            if (allSimMeds.some((med) => med.generalDrug === i && med.specificName === m)) {
                allSimMeds.push({
                    generalDrug: `${i}2`,
                    specificName: m
                });
            } else {
                allSimMeds.push({
                    generalDrug: i,
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

function averageValues(data) {
    const averagedData = data.reduce((result, obj) => {
        const key = Object.keys(obj)[0];
        const value = parseFloat(obj[key]);
        if (!isNaN(value)) {
            if (!result[key]) {
                result[key] = { sum: value, count: 1 };
            } else {
                result[key].sum += value;
                result[key].count++;
            }
        }
        return result;
    }, {});
    Object.keys(averagedData).forEach((key) => {
        averagedData[key] = averagedData[key].sum / averagedData[key].count;
    });
    return averagedData;
}

export {
    //general getters
    getNadacMeds,
    getNdcFromMed,
    getMedNames,
    getQualityMeasures,
    getRateDefinitions,
    getStates,
    //data retrieval
    getMedData,
    getDrugUtilData,
    //plotting
    plotNadacMed,
    plotRateBar,
    plotRateTimeSeries,
    plot,
    //Observable notebook helpers
    getSimilarMeds,
    parseSelectedMeds,
    Plotly
}