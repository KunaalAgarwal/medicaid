import {getDatasetByKeyword, convertDatasetToDistributionId} from "../metastore.js";
import {getDatastoreQuerySql} from "../sql.js";
import {getAllData, plot, plotifyData} from "./plot.js";
import {endpointStore} from "../httpMethods.js";

endpointStore.setItem("NadacUpdate", Date.now());
let nadacDatasets;
let nadacDistributions;
let ndcObjMap;
await preImport();

async function getAllNdcObjs() {
    const ndcs = new Map();
    for (let i = 0; i < nadacDistributions.length; i += 4){
        if (i >= nadacDistributions.length){
            break;
        }
        const response = await getDatastoreQuerySql(`[SELECT ndc,ndc_description FROM ${nadacDistributions[i]}]`);
        response.forEach(ndcObj => {
            if (!ndcs.has(ndcObj["ndc_description"])){
                ndcs.set(ndcObj["ndc_description"], new Set());
            }
            ndcs.get(ndcObj["ndc_description"]).add(ndcObj["ndc"]);
        })
    }
    await updateNadac();
    return ndcs;
}

async function getNadacMeds(){
    if (ndcObjMap === undefined){
        ndcObjMap = await getAllNdcObjs();
    }
    return [...ndcObjMap.keys()].sort()
}

async function getNdcFromMed(med){
    if (ndcObjMap === undefined){
        ndcObjMap = await getAllNdcObjs();
    }
    if (ndcObjMap.has(med)){
        return Array.from(ndcObjMap.get(med));
    }
    throw new Error("Please provide a medicine that is included in the medicaid dataset.");
}

async function getMedNames(medicine){
    const baseMedName = medicine.split(" ")[0];
    const medList = Array.from(await getNadacMeds());
    return medList.filter(med => med.split(' ')[0] === `${baseMedName.toUpperCase()}`)
}

async function getMedData(items, filter = "ndc", dataVariables = ["as_of_date", "nadac_per_unit"]){
    const rawData = await getAllData(items, filter, nadacDistributions, dataVariables);
    await updateNadac();
    return rawData.flat()
}

async function getMedPlotData(meds, filter, axis = {xAxis: "as_of_date", yAxis: "nadac_per_unit"}){
    const medList = Array.isArray(meds) ? meds : [meds];
    const medData = await getMedData(medList, filter, Object.values(axis));
    const plotData = plotifyData(medData, axis);
    return {x: plotData[axis.xAxis], y: plotData[axis.yAxis], name: medList[0]}
}

async function plotNadacNdc(ndcs, layout, div, axis) {
    if (ndcs === undefined){
        return;
    }
    const medList = Array.isArray(ndcs) ? ndcs : [ndcs];
    const data = await Promise.all(medList.map(med => getMedPlotData(med, "ndc", axis)))
    return plot(data, layout, "line", div);
}
async function plotNadacMed(meds, layout, div, axis){
    if (meds === undefined){
        return;
    }
    const medList = Array.isArray(meds) ? meds : [meds];
    const data = await Promise.all(medList.map(med => getMedPlotData(med, "ndc_description", axis)))
    return plot(data, layout, "line", div);
}

async function preImport(){
    let datasets = (await getDatasetByKeyword("nadac")).filter(r => r.title.includes("(National Average Drug Acquisition Cost)"))
    nadacDatasets = datasets.sort((a, b) => a.title.localeCompare(b.title))
    nadacDistributions = await Promise.all(nadacDatasets.map(r => {return convertDatasetToDistributionId(r.identifier)}));
}

async function updateNadac() {
    if (Date.now() - await endpointStore.getItem("NadacUpdate") > 3600000) {
        const latestNadacId = nadacDatasets[0].identifier;
        await endpointStore.removeItem(`metastore/schemas/dataset/items/${latestNadacId}`)
        await endpointStore.removeItem("metastore/schemas/dataset/items");
        await endpointStore.removeItem("metastore/schemas/distribution/items");
        await endpointStore.setItem("NadacUpdate", Date.now());
        await preImport();
    }
}

export {
    //general
    getNadacMeds,
    getNdcFromMed,
    getMedNames,
    getAllNdcObjs,
    //data collection
    getMedData,
    //plotting
    plotNadacNdc,
    plotNadacMed
}

