import {convertDatasetToDistributionId, getDatasetByKeyword, getDatasetByTitleName} from "../metastore.js";
import {getDatastoreQuerySql} from "../sql.js";
import {getAllData, plot} from "./plot.js"

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
    //general
    getQualityMeasures,
    getRateDefinitions,
    getStates,
    //plotting
    plotRateBar,
    plotRateTimeSeries
}