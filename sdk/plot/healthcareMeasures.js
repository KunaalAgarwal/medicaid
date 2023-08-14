import {convertDatasetToDistributionId, getDatasetByKeyword} from "../metastore.js";
import {getDatastoreQuerySql} from "../sql.js";
import {getAllData, plot, averageValues} from "./plot.js"
import {getDatastoreImport} from "../datastore.js";

let distributions;
await preImport();
async function getHealthcareQualityData(qualityMeasure){
    return await getDatastoreQuerySql(`[SELECT * FROM ${distributions[distributions.length - 1]}][WHERE measure_name === "${qualityMeasure}"]`)
}

async function getQualityMeasures(){
    let measureObjects = await getDatastoreQuerySql(`[SELECT measure_name FROM ${distributions[distributions.length - 1]}]`)
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
    return {x: Object.keys(averagedData), y: Object.values(averagedData), name: `2020: ${rateDef}`}
}

async function getRateTimeSeriesData(states, rateDef) {
    const rawData = await getAllData(states, "state", distributions, ["ffy", "state_rate", "rate_definition"]);
    const adjustedData = rawData.flat().filter(x => x["rate_definition"] === rateDef);
    const av = averageValues(adjustedData.map(x => ({[x["ffy"]]: x["state_rate"]})));
    return {x: Object.keys(av), y: Object.values(av), name: states[0]};
}

async function plotRateBar(rateDef, qualityMeasure, layout, div){
    const data = await getRateBarData(rateDef, qualityMeasure);
    return plot(data, layout, "bar", div)
}

async function plotRateTimeSeries(stateList, layout, rateDef, div) {
    if (stateList === undefined) throw new Error("Please enter valid states.");
    const states = Array.isArray(stateList) ? stateList : [stateList];
    const data = await Promise.all(states.map(state => getRateTimeSeriesData(state, rateDef)));
    return plot(data, layout, "line", div);
}

async function getHealthcareMeasuresInfo(){
    return getDatastoreImport(distributions[distributions.length - 1]);
}

async function preImport(){
    let datasets = await getDatasetByKeyword("performance rates");
    datasets.sort((a, b) => a.title.localeCompare(b.title));
    let ids = await Promise.all(datasets.map(d => convertDatasetToDistributionId(d.identifier)))
    distributions = ids.slice(2, ids.length)
}

export {
    //general
    getQualityMeasures,
    getRateDefinitions,
    getStates,
    getHealthcareMeasuresInfo,
    //plotting
    plotRateBar,
    plotRateTimeSeries
}