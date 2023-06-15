import {getItems} from "./httpMethods.js";

async function getDatastoreQuerySql(sqlQuery, showColumnFlag = true) {
    //handles all sql query GET requests
    try {
        let baseEndpoint = `datastore/sql?query=${sqlQuery}&show_db_columns=${showColumnFlag}`;
        let limit = parseLimit(sqlQuery);
        if (limit <= 10000 && limit !== null){
            return await getItems(baseEndpoint);
        }
        else if (limit > 10000){
            return await sqlHighLimit(sqlQuery, baseEndpoint, showColumnFlag);
        }
        return await sqlNoLimit(sqlQuery, baseEndpoint, showColumnFlag);
    } catch (Error) {
        console.log("The request could not be fulfilled");
    }
}

function parseOffset(query) {
    if (query.includes("OFFSET")) {
        let offset = query.split("OFFSET")[1].trimStart().split("]")[0]
        return parseInt(offset);
    }
    return 0;
}

function parseLimit(query){
    if (query.includes("LIMIT")) {
        let limit = (query.split("LIMIT")[1].trimStart().split(" ")[0]).split("]")[0]
        return parseInt(limit)
    }
    return null;
}

async function sqlHighLimit(sqlQuery, baseEndpoint, showColumnFlag){
    //executes sql query for limits above the api's max limit (10000)
    let allData = [];
    let offset = parseOffset(sqlQuery)
    let limit = parseLimit(sqlQuery)
    while (limit > 0) {
        let currentLimit = Math.min(limit, 10000);
        let updatedQuery;
        if (offset > 0){
            updatedQuery = sqlQuery.replace(/\[LIMIT \d+/, `[LIMIT ${currentLimit}`).replace(/\[OFFSET \d+\]/, `[OFFSET ${offset}]`);
        } else {
            updatedQuery = sqlQuery.replace(/\[LIMIT \d+/, `[LIMIT ${currentLimit}`)
        }
        baseEndpoint = `datastore/sql?query=${updatedQuery}&show_db_columns=${showColumnFlag}`;
        const results = await getItems(baseEndpoint);
        allData.push(...results);
        offset += currentLimit;
        limit -= currentLimit;
    }
    return allData;
}

async function fetchChunk(offset, limit, sqlQuery, showColumnFlag) {
    let adjustedQuery;
    if (sqlQuery.includes("OFFSET")) {
        adjustedQuery = sqlQuery.replace(/OFFSET \d+\]/, `LIMIT ${limit} OFFSET ${offset}]`);
    } else {
        adjustedQuery = `${sqlQuery}[LIMIT ${limit} OFFSET ${offset}]`;
    }
    const baseEndpoint = `datastore/sql?query=${adjustedQuery}&show_db_columns=${showColumnFlag}`;
    return getItems(baseEndpoint);
}

async function sqlNoLimit(sqlQuery, baseEndpoint, showColumnFlag) {
    let allData = [];
    let limit = 10000;
    let offset = parseOffset(sqlQuery);
    let responses;
    do {
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(fetchChunk(offset + i * limit, limit, sqlQuery, showColumnFlag));
        }
        responses = await Promise.all(promises);
        responses.forEach(chunk => {
            allData.push(...chunk);
        });
        offset += limit * 5;
    } while (responses.some(response => response.length === limit));
    return allData;
}

export{
    getDatastoreQuerySql
}