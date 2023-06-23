import {getDatastoreQuerySql} from "./sql.js";

let nadacDistributions = [
    "37ad62a2-f107-5ec9-b168-000694b6b8b9",
    "92d88e07-d0c0-54c7-bb2c-a1093f28b5de",
    "ac6a5a27-f625-5247-a6e3-a0b8ddfae7fd",
    "3b54f1b4-1bae-5d03-8036-dbb5c7120428",
    "f4ab6cb6-e09c-52ce-97a2-fe276dbff5ff",
    "94749796-fa79-507c-a622-e724ef63bec2",
    "135a02e5-1885-5585-8b46-4094a83cc16f",
    "c961ae91-bf7a-5ab6-98f4-f84ee765c71c",
    "88b0eac5-6164-5737-b746-16eaefd52664",
    "99cac002-f9d9-565b-b23a-7e9be602ba74",
    "c5be50a1-0b23-5fcf-8b82-da7189b60e92"
]

async function getAllNadacMeds(){
    //uses the 2017 nadac
    let sql = `[SELECT ndc_description FROM f4ab6cb6-e09c-52ce-97a2-fe276dbff5ff]`
    return await getDatastoreQuerySql(sql);
}

async function getMedNames(medicine){
    const medList = await getAllNadacMeds()
    let medNames = {};
    medList.forEach(med => {
        med = med.ndc_description.toUpperCase();
        if (med.includes(medicine.toUpperCase())){
            medNames[med] = "1";
        }})
    return Object.keys(medNames);
}

async function getAllDataFromMed(med, vars = {xAxis: "as_of_date", yAxis: "nadac_per_unit"}){
    try{
        const meds = await getMedNames(med)
        let xValues = [];
        let yValues = [];
        for (let dataset of nadacDistributions){
            for (let med of meds){
                let sql = `[SELECT ndc_description,${vars.xAxis},${vars.yAxis} FROM ${dataset}][WHERE ndc_description = "${med}"]`
                const data = await getDatastoreQuerySql(sql);
                for (let datapoint of data){
                    xValues.push(datapoint[vars.xAxis]);
                    yValues.push(datapoint[vars.yAxis]);
                }
            }
        }
        return {x: xValues, y: yValues}
    } catch (error){
        console.log("There was an error collecting the data.")
    }
}

async function createPlot(data, layout){
    const plot = document.createElement('a');
    data.forEach(trace => {trace.x.sort()})
    Plotly.newPlot(plot, data, layout)
    return plot
}

export {
    getAllNadacMeds,
    getMedNames,
    getAllDataFromMed,
    createPlot
}