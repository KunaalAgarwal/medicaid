import {getAllData, plot, averageValues} from "./plot.js";
import {convertDatasetToDistributionId, getDatasetByKeyword} from "../metastore.js";
import {getDatastoreQuerySql} from "../sql.js";
import {getDatastoreImport} from "../datastore.js";

let datasets;
let distributions;
await preImport();

async function getRawUtilData(items, filter = "ndc", dataVariables = ["year", "total_amount_reimbursed", "number_of_prescriptions", "suppression_used"]){
    if (items === undefined) throw new Error("Please provide valid NDCs.");
    const adjustedNdcsList = Array.isArray(items) ? items : [items];
    if (!dataVariables.includes("suppression_used")) {
        dataVariables.push("suppression_used");
    }
    return await getAllData(adjustedNdcsList, filter, distributions, dataVariables);
}

async function getUtilData(items, filter, dataVariables) {
    const rawData = await getRawUtilData(items, filter, dataVariables);
    const results = [];
    for (const datapoint of rawData.flat()) {
        const { suppression_used, ...rest } = datapoint;
        if (suppression_used === "false") {
            results.push(rest);
        }
    }
    return results;
}

async function getUtilDataTimeSeries(items, axis= {yAxis: "total_amount_reimbursed", y2: "number_of_prescriptions", filter: "ndc"}){
    const data = await getRawUtilData(items, axis.filter);
    const result = data.reduce((acc, dataset) => {
        const filteredData = dataset.filter(x => x["suppression_used"] === "false");
        if (filteredData.length > 0) {
            acc.xData.push(filteredData[0]["year"]);
            acc.yData.push(filteredData.reduce((total, datapoint) => total + parseFloat(datapoint[axis.yAxis]), 0));
            acc.y2Data.push(filteredData.reduce((total, datapoint) => total + parseFloat(datapoint[axis.y2]), 0));
        }
        return acc;
    }, {xData: [], yData: [], y2Data: []});
    result.xData.sort()
    return [{x: result.xData, y: result.yData, name: axis.yAxis}, {x: result.xData, y: result.y2Data, yaxis:'y2', name: axis.y2}]
}

async function plotUtilTimeSeries(items, layout, div, axis) {
    if (items === undefined) return;
    const medList = Array.isArray(items) ? items : [items];
    const data = await Promise.all(medList.map(med => getUtilDataTimeSeries(med, axis)))
    return plot(data.flat(), layout, "line", div);
}

async function getDrugUtilDataBar(item, dataParams = {yAxis: "total_amount_reimbursed", year: '2022', filter: "ndc"}) {
    const datasetId = datasets.indexOf(datasets.filter(dataset => dataset["title"].includes(dataParams.year))[0]);
    const response = await getDatastoreQuerySql(`[SELECT state,${dataParams.yAxis},suppression_used FROM ${distributions[datasetId]}][WHERE ${dataParams.filter} = "${item}"]`);
    const filteredData = response.filter(x => x["suppression_used"] === "false");
    const av = averageValues(filteredData.map(x => ({[x.state]: x[dataParams.yAxis]})));
    return {x: Object.keys(av), y: Object.values(av)}
}

async function plotDrugUtilBar(item, layout, div, dataParams){
    if (item === undefined) return;
    const data = await getDrugUtilDataBar(item, dataParams)
    return plot(data, layout, "bar", div);
}

async function removedOutliers(data) {
    const yValues = data.y.slice();
    yValues.sort((a, b) => a - b);
    const q1 = yValues[Math.floor(yValues.length * 0.25)];
    const q3 = yValues[Math.ceil(yValues.length * 0.75)];
    const iqr = q3 - q1;
    const maxValue = q3 + iqr * 1.5;
    const minValue = q1 - iqr * 1.5;

    return {
        x: data.x.filter((_, i) => data.y[i] >= minValue && data.y[i] <= maxValue),
        y: data.y.filter((y) => y >= minValue && y <= maxValue)
    }
}

async function getUtilMapData(item, dataParams = {outliers: true, filter: "ndc", yAxis: "total_amount_reimbursed", year: "2022"}){
    let data =  await getDrugUtilDataBar(item, dataParams);
    if (dataParams.outliers) data = await removedOutliers(data);
    const allStates = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'GU', 'HI', 'IA', 'ID',
        'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE',
        'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];
    allStates.forEach(state => {
        if (!data.x.includes(state)){
            data.x.push(state);
            data.y.push(-1);
        }
    })
    return [{
        type: 'choropleth',
        locationmode: 'USA-states',
        locations: data.x,
        z: data.y,
        zmin: 0,
        zmax: Math.max(...data.y),
        colorscale: [
            [0, 'rgb(211, 211, 211)'],
            [0.001, 'rgb(242,240,247)'],
            [0.01, 'rgb(242,240,247)'], [0.2, 'rgb(218,218,235)'],
            [0.4, 'rgb(188,189,220)'], [0.6, 'rgb(158,154,200)'],
            [0.8, 'rgb(117,107,177)'], [1, 'rgb(84,39,143)']
        ],
        colorbar: {
            title: 'Total Amount Reimbursed',
            x: 1,
            y: 0.6
        },
        marker: {
            line: {
                color: 'rgb(255,255,255)',
                width: 2
            }
        }
    }];
}

async function plotUtilMap(item, dataParams, div) {
    const layout = {
        title: '2022 US Total Amount Reimbursed by State',
        geo: {
            scope: 'usa',
            showlakes: true,
            lakecolor: 'rgb(255,255,255)'
        },
        width: 800,
        height: 600
    };
    return plot(await getUtilMapData(item, dataParams), layout, "choropleth", div);
}

async function getUtilInfo(){
    return getDatastoreImport(distributions[distributions.length - 1]);
}

async function getDrugUtilDataXX(item, filter, yAxis) {
    let range = 2022-2014+1;
    let allYears = [...Array(range).keys()].map(o => 2014+o);
    let res;
    res = Promise.all(allYears.map(async (year) => {
        let data = await getDrugUtilDataBar(item, {filter: filter, yAxis: yAxis, year: "2022"});
        return {year: year, xx: data['y'][data['x'].indexOf('XX')]};
    })).then(refinedData => refinedData.filter(o => o.xx !== undefined));
    return res;
}

async function plotDrugUtilDataXX(ndc, div, layout, yAxis) {
    let res = {};
    let data = await getDrugUtilDataXX(ndc, yAxis);
    res['x'] = data.map(o => o.year);
    res['y'] = data.map(o => o.xx)
    return plot([res], layout, "line", div);
}

async function preImport(){
    datasets = (await getDatasetByKeyword("drug utilization")).slice(22);
    distributions = await Promise.all(datasets.map(async dataset => await convertDatasetToDistributionId(dataset.identifier)));
}

export {
    getUtilData,
    getUtilDataTimeSeries,
    getDrugUtilDataBar,
    getUtilMapData,
    getUtilInfo,
    getDrugUtilDataXX,
    plotUtilTimeSeries,
    plotDrugUtilBar,
    plotUtilMap,
    plotDrugUtilDataXX
}