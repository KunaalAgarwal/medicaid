import {getItems} from "./httpMethods.js";

async function getDatastoreQuerySql(sqlQuery) {
    //handles all sql query GET requests
    let result;
    let limit= parseLimit(sqlQuery)
    if (!limit){
        result = await sqlNoLimit(sqlQuery);
    }
    else if (limit <= 10000){
        result = await getItems(`datastore/sql?query=${sqlQuery}&show_db_columns=false`);
    } else {
        result = await sqlHighLimit(sqlQuery);
    }
    if (result === undefined){
        throw new Error("The SQL query could not be executed.")
    }
    return result;
}

function parseOffset(query) {
    if (query.includes("OFFSET")) {
        let offset = query.split("OFFSET")[1].trimStart().split("]")[0]
        return parseInt(offset);
    }
    return null;
}

function parseLimit(query){
    if (query.includes("LIMIT")) {
        let limit = (query.split("LIMIT")[1].trimStart().split(" ")[0]).split("]")[0]
        return parseInt(limit)
    }
    return null;
}

async function fetchChunk(offset, limit, sqlQuery) {
    let adjustedQuery;
    let parsedOffset = parseOffset(sqlQuery);
    let parsedLimit = parseLimit(sqlQuery);
    if (parsedOffset){
        if (parsedLimit){
            const splitQuery = sqlQuery.split(`[LIMIT ${parsedLimit} OFFSET ${parsedOffset}]`);
            adjustedQuery = `${splitQuery[0]}[LIMIT ${limit} OFFSET ${offset}]`
        } else {
            const splitQuery = sqlQuery.split(`[OFFSET ${parsedOffset}]`);
            adjustedQuery = `${splitQuery[0]}[LIMIT ${limit} OFFSET ${offset}]`
        }
    } else {
        if (parsedLimit){
            const splitQuery = sqlQuery.split(`[LIMIT`)
            adjustedQuery = `${splitQuery[0]}[LIMIT ${limit} OFFSET ${offset}]`;
        } else {
            adjustedQuery = `${sqlQuery}[LIMIT ${limit} OFFSET ${offset}]`
        }
    }
    const baseEndpoint = `datastore/sql?query=${adjustedQuery}&show_db_columns=false`;
    return getItems(baseEndpoint);
}

async function sqlHighLimit(sqlQuery){
    let promises = [];
    let limit = parseLimit(sqlQuery);
    let offset = parseOffset(sqlQuery) || 0;
    const firstRequestCheck = await fetchChunk(offset, 10000, sqlQuery);
    if (firstRequestCheck.length < 10000){
        return firstRequestCheck;
    }
    while (limit > 0) {
        const currentLimit = Math.min(limit, 10000);
        promises.push(fetchChunk(offset, currentLimit, sqlQuery));
        offset += 10000;
        limit -= currentLimit;
    }
    const responses = await Promise.all(promises);
    return responses.flat();
}

async function sqlNoLimit(sqlQuery) {
    let allData = [];
    let offset = parseOffset(sqlQuery) || 0;
    let condition = true
    let responses = [];
    let count = 0;
    const firstRequestCheck = await fetchChunk(offset, 1000, sqlQuery);
    if (firstRequestCheck.length < 1000){
        return firstRequestCheck;
    }
    while (condition){
        const promises = [];
        for (let i = 0; i < 3; i++) {
            promises.push(fetchChunk(offset, 10000, sqlQuery));
            offset += 10000;
        }
        responses = await Promise.all(promises);
        count += promises.length;
        allData.push(...responses.flat())
        if (responses.some(response => response.length !== 10000)){
            condition = false;
        }
    }
    return allData;
}

export{
    getDatastoreQuerySql
}