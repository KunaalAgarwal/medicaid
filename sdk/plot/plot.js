import {getDatastoreQuerySql} from "../sql.js";
import Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm';

async function getUniqueValues(variable, distribution) {
    // Use State Utilization Data 2014
    let all_values = await getDatastoreQuerySql(`[SELECT ${variable} FROM ${distribution}]`);
    let unique_values = new Set(all_values.map(o => o[variable]));
    return (Array.from(unique_values)).sort();
}

function plot(data, layout, type = "line", divElement = null){
    const adjustedData = Array.isArray(data) ? data : [data];
    const div = divElement || document.createElement('div');
    adjustedData.forEach(trace => {trace.type = type})
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

function plotifyData(data, axis) {
    return Object.values(axis).reduce(
        (result, field) => {
            result[field] = data.map(obj => obj[field]);
            result[field].sort();
            return result;
        },
        {}
    );
}

function averageValues(data) {
    const averagedData = data.reduce((result, obj) => {
        const key = Object.keys(obj)[0];
        const value = parseFloat(obj[key]);
        if (!isNaN(value)) {
            if (!result[key]) {
                result[key] = { sum: value, count: 1 };
            } else {
                result[key].sum += value;
                result[key].count++;
            }
        }
        return result;
    }, {});
    Object.keys(averagedData).forEach((key) => {
        averagedData[key] = averagedData[key].sum / averagedData[key].count;
    });
    return averagedData;
}


export {
    getUniqueValues,
    plot,
    getAllData,
    plotifyData,
    averageValues,
    Plotly
}