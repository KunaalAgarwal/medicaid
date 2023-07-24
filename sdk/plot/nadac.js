import {getDatasetByKeyword, convertDatasetToDistributionId} from "../metastore.js";
import {getDatastoreQuerySql} from "../sql.js";
import {getAllData, plot} from "./plot.js";
import {getItems} from "../../sdk.js";
//pre import retrieval
const nadacDatasets = (await getDatasetByKeyword("nadac")).filter(r => r.title.includes("(National Average Drug Acquisition Cost)"))
const nadacDistributions = await Promise.all(nadacDatasets.map(r => {return convertDatasetToDistributionId(r.identifier)}))

async function getNadacMeds(){
    //waiting on fda api
    const medlist = await getAllNdcs();
    return new Set(medlist.values());
}

async function getNdcFromMed(med){
    //waiting on fda api
    const sql = `[SELECT ndc_description,ndc FROM f4ab6cb6-e09c-52ce-97a2-fe276dbff5ff][WHERE ndc_description = "${med}"][LIMIT 1]`;
    const response = await getDatastoreQuerySql(sql);
    return response[0]["ndc"]
}

async function getMedNames(medicine){
    const baseMedName = medicine.split(" ")[0];
    const medList = Array.from(await getNadacMeds());
    return medList.filter(med => med.split(' ')[0] === `${baseMedName.toUpperCase()}`)
}

async function getMedData(meds, filter = "ndc", dataVariables = ["as_of_date", "nadac_per_unit"]){
    const rawData = await getAllData(meds, filter, nadacDistributions, dataVariables);
    return rawData.flat()
}

async function getMedDataPlot(meds, axis = {xAxis: "as_of_date", yAxis: "nadac_per_unit"}){
    const medList = Array.isArray(meds) ? meds : [meds];
    const medData = await getMedData(medList, "ndc", Object.values(axis));
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

async function plotNadacMed(meds, layout, div, axis) {
    if (meds === undefined){
        return;
    }
    const medList = Array.isArray(meds) ? meds : [meds];
    const data = await Promise.all(medList.map(med => getMedDataPlot(med, axis)))
    return plot(data, layout, "line", div);
}

async function getSimilarMeds(medList) {
    //waiting on fda api
    let allSimMeds = [];
    for (let i of medList) {
        let meds = await getMedNames(i);
        for (let m of meds) {
            if (allSimMeds.some((med) => med.generalDrug === i && med.specificName === m)) {
                allSimMeds.push({
                    generalDrug: `${i}2`,
                    specificName: m
                });
            } else {
                allSimMeds.push({
                    generalDrug: i,
                    specificName: m
                });
            }
        }
    }
    return allSimMeds;
}

function parseSelectedMeds(medList) {
    //waiting on fda api
    return Object.values(medList.reduce((result, obj) => {
        const {generalDrug, specificName} = obj;
        if (generalDrug in result) {
            result[generalDrug].push(specificName);
        } else {
            result[generalDrug] = [specificName];
        }
        return result;
    }, {}));
}

async function getAllNdcs() {
    let startTime = Date.now();
    const ndcs = new Map();
    for (let i = 0; i < nadacDistributions.length; i += 4){
        if (i > nadacDistributions.length){
            break;
        }
        const response = await getDatastoreQuerySql(`[SELECT ndc FROM ${nadacDistributions[i]}]`);
        response.forEach(ndc => {ndcs.set(ndc["ndc"], 1);})
    }
    console.log(`Grabbed Data: ${Date.now() - startTime}`)
    return [...ndcs.keys()];
}

async function ndcToName(nadacNdc) {
    const fdaUrl = "https://api.fda.gov/drug/ndc.json";
    const searchQuery = nadacNdc.slice(0, 5).replace(/^0/, '') + "-" + nadacNdc.slice(5, 9).replace(/^0/, '');
    const response = await getItems(`?search=product_ndc:"${searchQuery}"`, false, fdaUrl);
    const results = response["results"][0];
    if (results["active_ingredients"] !== undefined) {
        return Object.values(results["active_ingredients"][0]).join(" ");
    } else {
        return results["brand_name"];
    }
}

export {
    //general
    getAllNdcs,
    getNadacMeds,
    getNdcFromMed,
    getMedNames,
    getSimilarMeds,
    parseSelectedMeds,
    ndcToName,
    //data collection
    getMedData,
    //plotting
    plotNadacMed
}

