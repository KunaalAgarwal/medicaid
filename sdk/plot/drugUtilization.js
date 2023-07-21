import {getNdcFromMed} from "./nadac.js";
import {getAllData, plot} from "./plot.js";
import {convertDatasetToDistributionId, getDatasetByKeyword} from "../metastore.js";

//pre import retrieval
const drugUtilDatasets = (await getDatasetByKeyword("drug utilization")).slice(22); //only need datasets from 2013 onwards
const drugUtilIds = await Promise.all(drugUtilDatasets.map(async dataset => await convertDatasetToDistributionId(dataset.identifier)));

async function rawDrugUtil(meds, filter = "ndc", dataVariables = ["year", "total_amount_reimbursed", "number_of_prescriptions", "suppression_used"]){
    const adjustedMedList = Array.isArray(meds) ? meds : [meds];
    const ndcList = await Promise.all(adjustedMedList.map(async med => await getNdcFromMed(med)));
    if (!dataVariables.includes("suppression_used")) {
        dataVariables.push("suppression_used");
    }
    return await getAllData(ndcList, filter, drugUtilIds, dataVariables);
}

async function getDrugUtilData(meds, filter, dataVariables) {
    const rawData = await rawDrugUtil(meds, filter, dataVariables);
    const results = [];
    for (const datapoint of rawData.flat()) {
        const { suppression_used, ...rest } = datapoint;
        if (suppression_used === "false") {
            results.push(rest);
        }
    }
    return results;
}

async function getDrugUtilDataPlot(meds, axis= {x: "year", y: "total_amount_reimbursed", y2: "number_of_prescriptions"}){
    const data = await rawDrugUtil(meds);
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
    return [{x: result.xData, y: result.yData}, {x: result.xData, y: result.y2Data, yaxis: 'y2'}]
}

async function plotDrugUtil(meds, layout, div, axis) {
    if (meds === undefined){
        return;
    }
    const medList = Array.isArray(meds) ? meds : [meds];
    const data = await Promise.all(medList.map(med => getDrugUtilDataPlot(med, axis)))
    return plot(data.flat(), layout, "line", div);
}


export {
    //data retrieval
    getDrugUtilData,
    //plotting
    plotDrugUtil
}