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
    const adjustedData = Array.isArray(data) ? data : [data];
    const div = divElement || document.createElement('div');
    for (let trace of adjustedData){trace.type = type}
    Plotly.newPlot(div, adjustedData, layout);
    return div;
}

async function getAllData(items, filter, distributions, dataVariables){
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
    const result = await Promise.all(fetchDataPromises);
    if (result === undefined){
        throw new Error("All the data could not be retrieved.")
    }
    return result;
}

export {
    getUniqueValues,
    plot,
    getAllData,
    Plotly
}