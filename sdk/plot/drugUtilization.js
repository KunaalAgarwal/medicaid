import {getAllData, plot} from "./plot.js";
import {convertDatasetToDistributionId, getDatasetByKeyword, getDatasetByTitleName} from "../metastore.js";
import {getDatastoreQuerySql} from "../sql.js";

//pre import retrieval
const drugUtilDatasets = (await getDatasetByKeyword("drug utilization")).slice(22); //only need datasets from 2013 onwards
const drugUtilIds = await Promise.all(drugUtilDatasets.map(async dataset => await convertDatasetToDistributionId(dataset.identifier)));

async function rawDrugUtil(ndcs, filter = "ndc", dataVariables = ["year", "total_amount_reimbursed", "number_of_prescriptions", "suppression_used"]){
    const adjustedNdcsList = Array.isArray(ndcs) ? ndcs : [ndcs];
    if (!dataVariables.includes("suppression_used")) {
        dataVariables.push("suppression_used");
    }
    return await getAllData(adjustedNdcsList, filter, drugUtilIds, dataVariables);
}

async function getDrugUtilData(ndcs, filter, dataVariables) {
    const rawData = await rawDrugUtil(ndcs, filter, dataVariables);
    const results = [];
    for (const datapoint of rawData.flat()) {
        const { suppression_used, ...rest } = datapoint;
        if (suppression_used === "false") {
            results.push(rest);
        }
    }
    return results;
}

async function getDrugUtilDataPlot(ndcs, axis= {x: "year", y: "total_amount_reimbursed", y2: "number_of_prescriptions"}){
    const data = await rawDrugUtil(ndcs);
    const result = data.reduce((acc, dataset) => {
        const filteredData = dataset.filter(x => x["suppression_used"] === "false");
        if (filteredData.length > 0) {
            acc.xData.push(filteredData[0][axis.x]);
            acc.yData.push(filteredData.reduce((total, datapoint) => total + parseFloat(datapoint[axis.y]), 0));
            acc.y2Data.push(filteredData.reduce((total, datapoint) => total + parseFloat(datapoint[axis.y2]), 0));
        }
        return acc;
    }, {xData: [], yData: [], y2Data: []});
    result.xData.sort()
    return [{x: result.xData, y: result.yData, name: ndcs[0] + axis.y}, {x: result.xData, y: result.y2Data, yaxis:'y2', name: ndcs[0] + axis.y2}]
}

async function plotDrugUtil(ndcs, layout, div, axis) {
    if (ndcs === undefined){
        return;
    }
    const medList = Array.isArray(ndcs) ? ndcs : [ndcs];
    const data = await Promise.all(medList.map(med => getDrugUtilDataPlot(med, axis)))
    return plot(data.flat(), layout, "line", div);
}


async function getDrugUtilDataBar(ndc, yAxis = "total_amount_reimbursed", year = '2022') {
    const drugUtil = await getDatasetByTitleName("State Drug Utilization Data " + year);
    const drugUtilId = await convertDatasetToDistributionId(drugUtil.identifier);
    const response = await getDatastoreQuerySql(`[SELECT state,${yAxis},suppression_used FROM ${drugUtilId}][WHERE ndc = "${ndc}"]`);
    const filteredData = response.filter(x => x["suppression_used"] === "false");
    const states = filteredData.reduce((stateTotals, obj) => {
        if (!stateTotals[obj["state"]]) {
            stateTotals[obj["state"]] = {sum: parseFloat(obj[yAxis]), count: 1};
        } else {
            stateTotals[obj["state"]].sum += parseFloat(obj[yAxis]);
            stateTotals[obj["state"]].count += 1;
        }
        return stateTotals
    }, {});
    const yVals = Object.values(states).reduce((result, obj) => {
        result.push(obj["sum"]/obj["count"]);
        return result;
    }, [])
    return {x: Object.keys(states), y: yVals};
}

async function plotDrugUtilBar(ndc, layout, div, yAxis){
    if (ndc === undefined){
        return;
    }
    const data = await getDrugUtilDataBar(ndc, yAxis)
    return plot(data, layout, "bar", div);
}


// Remove outliers from getDrugUtilDataBar
async function removedOutliers(ndc, yAxis, year) {
    let data = await getDrugUtilDataBar(ndc, yAxis, year);
    let refinedData = data['x'].map((o,i) => {return {x: o, y: data['y'][i]}})
    refinedData.sort( function(a, b) {return a.y - b.y;});
    let yValues = refinedData.map(o => o.y);

    let q1 = yValues[Math.floor((yValues.length / 4))];
    let q3 = yValues[Math.ceil((yValues.length * (3 / 4)))];
    let iqr = q3 - q1;
    let maxValue = q3 + iqr*1.5;
    let minValue = q1 - iqr*1.5;

    let nonOutlierPos = yValues.map((o,i) => {if((yValues[i] <= maxValue) && (yValues[i] >= minValue)) {return i}});
    let nonOutliers = refinedData.filter((o,i) => nonOutlierPos.includes(i));

    let res = {};
    res['x'] = nonOutliers.map(o => o.x);
    res['y'] = nonOutliers.map(o => o.y);
    return res;
}

// Get maximum of data with or without outliers
async function getMaximum(outliers = 'true', ndc = '00536105556', yAxis, year) {
    let data;
    if(outliers === 'true')  {
        data = await getDrugUtilDataBar(ndc, yAxis, year);
    } else {
        data = await removedOutliers(ndc, yAxis, year);
    }
    return Math.max.apply(Math, data['y']);

}

export {
    //data retrieval
    getDrugUtilData,
    getDrugUtilDataBar,
    removedOutliers,
    getMaximum,
    //plotting
    plotDrugUtil,
    plotDrugUtilBar
}