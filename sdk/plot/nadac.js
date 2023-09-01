import {getDatasetByKeyword, convertDatasetToDistributionId} from "../metastore.js";
import {getDatastoreQuerySql} from "../sql.js";
import {getAllData, plot, plotifyData, convertDate} from "./plot.js";
import {endpointStore} from "../httpMethods.js";
import {getDatastoreImport} from "../datastore.js";

endpointStore.setItem("NadacUpdate", Date.now());
let ndcs;
let distributions;
await preImport();

async function getAllNdcObjs() {
    await updateNadac();
    const ndcs = new Map();
    const cacheObj = await endpointStore.getItem("ndcObjMap")
    if (cacheObj !== null) {return cacheObj.response}
    for (let i = 0; i < distributions.length; i += 4){
        if (i >= distributions.length) break;
        const response = await getDatastoreQuerySql(`[SELECT ndc,ndc_description FROM ${distributions[i]}]`);
        response.forEach(ndcObj => {
            if (!ndcs.has(ndcObj["ndc_description"])){
                ndcs.set(ndcObj["ndc_description"], new Set());
            }
            ndcs.get(ndcObj["ndc_description"]).add(ndcObj["ndc"]);
        })
    }
    endpointStore.setItem("ndcObjMap", {response: ndcs, time: Date.now()});
    return ndcs;
}

async function getNadacMeds(){
    let ndcObjMap = await getAllNdcObjs();
    return [...ndcObjMap.keys()].sort()
}

async function getNadacNdcs(){
    let ndcObjMap = await getAllNdcObjs();
    return new Set([...ndcObjMap.values()].flatMap(x => Array.from(x)))
}

async function getNdcFromMed(med){
    let ndcObjMap = await getAllNdcObjs();
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
    if (ndcs === undefined) ndcs = await getNadacNdcs();
    if (items === undefined) throw new Error("Please provide valid items.");
    if (filter === "ndc"){
        items.forEach(item => {if (!ndcs.has(item)) throw new Error("This NDC is not contained within the Medicaid Dataset.");})
    }
    await updateNadac();
    const rawData = await getAllData(items, filter, distributions, dataVariables);
    return rawData.flat()
}

async function getMedPlotData(meds, filter, axis = {xAxis: "as_of_date", yAxis: "nadac_per_unit"}){
    const medList = Array.isArray(meds) ? meds : [meds];
    const medData = await getMedData(medList, filter, Object.values(axis));
    medData.sort((a,b) => convertDate(a[axis.xAxis]) - convertDate(b[axis.xAxis]))
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

async function getNadacInfo(){
    return getDatastoreImport(distributions[distributions.length - 1]);
}

async function preImport(){
    let datasets = (await getDatasetByKeyword("nadac", false)).filter(r => r.title.includes("(National Average Drug Acquisition Cost)"))
    datasets = datasets.sort((a, b) => a.title.localeCompare(b.title))
    distributions = await Promise.all(datasets.map(r => {return convertDatasetToDistributionId(r.identifier)}));
    await endpointStore.removeItem(`metastore/schemas/dataset/items/${datasets[datasets.length - 1].identifier}`)
}

async function updateNadac() {
    if (Date.now() - await endpointStore.getItem("NadacUpdate") > 3600000) {
        await endpointStore.setItem("NadacUpdate", Date.now());
        await endpointStore.removeItem("NdcObjMap");
        await preImport();
    }
}

export {
    //general
    getNadacMeds,
    getNadacNdcs,
    getNdcFromMed,
    getMedNames,
    getAllNdcObjs,
    getNadacInfo,
    //data collection
    getMedData,
    //plotting
    plotNadacNdc,
    plotNadacMed
}