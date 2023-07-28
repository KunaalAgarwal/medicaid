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
    return [{x: result.xData, y: result.yData, name: axis.y}, {x: result.xData, y: result.y2Data, yaxis:'y2', name: axis.y2}]
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
    const drugUtil = await getDatasetByTitleName(`State Drug Utilization Data ${year}`);
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

async function removedOutliers(data) {
    const yValues = data.y.slice();
    yValues.sort((a, b) => a - b);

    // Calculate the quartiles and IQR
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

async function plotDrugUtilMap(ndc, outliers = true, div, yAxis, year) {
    let data =  await getDrugUtilDataBar(ndc, yAxis, year);
    if (outliers) { data = await removedOutliers(data) }
    const allStates = new Set(['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'GU', 'HI', 'IA', 'ID',
        'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE',
        'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']);

    for (const state of allStates) {
        if (!data.x.includes(state)) {
            data.x.push(state);
            data.y.push(-1);
        }
    }

    let choroplethData = [{
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

    let layout = {
        title: '2022 US Total Amount Reimbursed by State',
        geo: {
            scope: 'usa',
            showlakes: true,
            lakecolor: 'rgb(255,255,255)'
        },
        width: 800,
        height: 600
    };
    return plot(choroplethData, layout, "choropleth", div);
}



export {
    //data retrieval
    getDrugUtilData,
    getDrugUtilDataBar,
    plotDrugUtilMap,
    //plotting
    plotDrugUtil,
    plotDrugUtilBar
}