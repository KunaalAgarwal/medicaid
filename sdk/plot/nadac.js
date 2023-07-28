import {getDatasetByKeyword, convertDatasetToDistributionId, getDatasetByTitleName} from "../metastore.js";
import {getDatastoreQuerySql} from "../sql.js";
import {getAllData, plot} from "./plot.js";
import {localforage, endpointStore} from "../httpMethods.js";

//pre import retrieval
// let updateDay = Date.now();
await localforage.ready();
let nadacDatasets = (await getDatasetByKeyword("nadac")).filter(r => r.title.includes("(National Average Drug Acquisition Cost)"))
let nadacDistributions = await Promise.all(nadacDatasets.map(r => {return convertDatasetToDistributionId(r.identifier)}))

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
    return ndcs;
}

async function getNadacMeds(){
    const ndcObjs = await getAllNdcObjs();
    return [...ndcObjs.keys()]
}

function getNdcFromMed(med, medToNdcMap){
    if (medToNdcMap.has(med)){
        return Array.from(medToNdcMap.get(med));
    }
    throw new Error("Please provide a medicine that is included in the medicaid dataset.");
}

async function getMedNames(medicine){
    const baseMedName = medicine.split(" ")[0];
    const medList = Array.from(await getNadacMeds());
    return medList.filter(med => med.split(' ')[0] === `${baseMedName.toUpperCase()}`)
}

async function getMedData(ndcs, filter = "ndc", dataVariables = ["as_of_date", "nadac_per_unit"]){
    // await updatePreImport();
    const rawData = await getAllData(ndcs, filter, nadacDistributions, dataVariables);
    return rawData.flat()
}

async function getMedDataPlot(ndcs, axis = {xAxis: "as_of_date", yAxis: "nadac_per_unit", filter: "ndc"}){
    const medList = Array.isArray(ndcs) ? ndcs : [ndcs];
    const medData = await getMedData(medList, axis.filter, Object.values(axis));
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

async function plotNadacMed(ndcs, layout, div, axis) {
    if (ndcs === undefined){
        return;
    }
    const medList = Array.isArray(ndcs) ? ndcs : [ndcs];
    const data = await Promise.all(medList.map(med => getMedDataPlot(med, axis)))
    return plot(data, layout, "line", div);
}

// async function updatePreImport(){
//     try {
//         if (Date.now() - updateDay <  18000000){// 5 hours in ms
//             return;
//         }
//         endpointStore.removeItem("metastore/schemas/dataset/items");
//         const nadac2023 = await getDatasetByTitleName("NADAC (National Average Drug Acquisition Cost) 2023");
//         const nadac2023id = nadac2023.identifier;
//         endpointStore.removeItem(`metastore/schemas/dataset/items/${nadac2023id}`);
//         endpointStore.removeItem("metastore/schemas/distribution/items");
//         nadacDatasets = (await getDatasetByKeyword("nadac")).filter(r => r.title.includes("(National Average Drug Acquisition Cost)"));
//         nadacDistributions = await Promise.all(nadacDatasets.map(r => {return convertDatasetToDistributionId(r.identifier)}));
//     } catch (error){
//         console.log("Update unsuccessful, clear cache if update still needed." + error);
//     }
// }

function parseSelectedMeds(meds, map){
    let medObjArray = [];
    meds.forEach(med => {
        const medNdcs = getNdcFromMed(med, map);
        medNdcs.forEach(ndc => {
            medObjArray.push({medName: med, ndc: ndc})
        })
    })
    return medObjArray;
}

function filterSelectedMeds(medList) {
    return Object.values(medList.reduce((result, obj) => {
        const {medName, ndc} = obj;
        if (medName in result) {
            result[medName].push(ndc);
        } else {
            result[medName] = [ndc];
        }
        return result;
    }, {}));
}

export {
    //general
    getNadacMeds,
    getNdcFromMed,
    getMedNames,
    getAllNdcObjs,
    parseSelectedMeds,
    filterSelectedMeds,
    //data collection
    getMedData,
    //plotting
    plotNadacMed

}

