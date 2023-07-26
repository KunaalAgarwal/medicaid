import {getDatastoreQuerySql} from "../sql.js";
import Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';

// Format names for drop-down selection (ex: states, medicines)
async function getUniqueValues(variable, distribution) {
    // Use State Utilization Data 2014
    let all_values = await getDatastoreQuerySql(`[SELECT ${variable} FROM ${distribution}]`);
    let unique_values = new Set(all_values.map(o => o[variable]));
    return (Array.from(unique_values)).sort();
}

function plot(data, layout, type = "line", divElement = null){
    try{
        const adjustedData = Array.isArray(data) ? data : [data];
        const div = divElement || document.createElement('div');
        for (let trace of adjustedData){trace.type = type}
        Plotly.newPlot(div, adjustedData, layout);
        return div;
    } catch (error){
        console.log("The plot could not be created.")
    }
}
async function getAllData(items, filter, distributions, dataVariables){
    try{
        if (items === undefined){
            return;
        }
        const fetchDataPromises = [];
        const itemsArray =  Array.isArray(items) ? items : [items];
        const varsString = dataVariables.join(',')
        const fetchData = async (identifier, item) => {
            let sql = `[SELECT ${varsString} FROM ${identifier}][WHERE ${filter} = "${item}"]`;
            return getDatastoreQuerySql(sql);
        }
        for (let distributionId of distributions) {
            itemsArray.forEach(item => {
                fetchDataPromises.push(fetchData(distributionId, item));
            })
        }
        return await Promise.all(fetchDataPromises);
    } catch (error){
        console.log("An error occurred in getAllData()" + error);
    }
}

export {
    getUniqueValues,
    plot,
    getAllData,
    Plotly
}