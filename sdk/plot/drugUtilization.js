import {getAllData, plot} from "./plot.js";
import {convertDatasetToDistributionId, getDatasetByKeyword} from "../metastore.js";

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
    return [{x: result.xData, y: result.yData, name: axis.y}, {x: result.xData, y: result.y2Data, yaxis: 'y2', name: axis.y2}]
}

async function plotDrugUtil(ndcs, layout, div, axis) {
    if (ndcs === undefined){
        return;
    }
    const medList = Array.isArray(ndcs) ? ndcs : [ndcs];
    const data = await Promise.all(medList.map(med => getDrugUtilDataPlot(med, axis)))
    return plot(data.flat(), layout, "line", div);
}

// Plot number_of_prescriptions vs. state for various medications in certain years
async function getDrugUtilDataBar(med, years = []) {
    let res = [];
    let drugUtilData = await getDrugUtilData([med], "ndc", ["state", "year", "total_amount_reimbursed", "number_of_prescriptions", "ndc","product_name"]);
    // Average number of prescriptions
    let avg = drugUtilData[0].number_of_prescriptions, counter = 0;
    drugUtilData.forEach((o,j) => {
        if(j < drugUtilData.length - 1 && o.state === drugUtilData[j+1].state && o.year === drugUtilData[j+1].year) {
            avg += parseFloat(drugUtilData[j+1].number_of_prescriptions);
            counter++;
        } else if(j < drugUtilData.length - 1) {
            res.push({state: o.state, year: Number(o.year), number_of_prescriptions: avg/counter, product_name: med});
            avg = parseFloat(drugUtilData[j+1].number_of_prescriptions);
            counter = 1;
        } else {
            res.push({state: o.state, year: Number(o.year), number_of_prescriptions: avg/counter, product_name: med})
        }
    })
    years = years.map(yr => parseInt(yr)); // Change strings to integers
    if(years.length !== 0) {
        res = res.filter(o => years.includes(o.year))
    }

    var data = [
      {
        x: res.map(o => o.state),
        y: res.map(o => o.number_of_prescriptions),
      }
    ];
    
    return [data[0]];
}

export {
    //data retrieval
    getDrugUtilData,
    //plotting
    plotDrugUtil,
    getDrugUtilDataBar
}