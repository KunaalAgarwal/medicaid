//'11196f15-1a77-5b80-97f3-c46c0ce19894'
//datastore = distribution

//https://data.medicaid.gov/api/1/datastore/imports/ {distribution id}
import {fetchItems, postItem} from '../sdk.js';

async function getDatastoreImport(datastoreId){
    try {
        return await fetchItems(`datastore/imports/${datastoreId}`);
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}

//datastore: query
function setRequestBody(datastoreId, columnName, columnValue, operator, limit){
    return {
        "conditions": [
            {
                "resource": "t",
                "property": `${columnName}`,
                "value": `${columnValue}`,
                "operator": `${operator}`
            }
        ],
        "limit": limit,
        "resources": [
            {
                "id": `${datastoreId}`,
                "alias": "t"
            }
        ]
    }
}
async function datastoreQuery(datastoreId, columnName, columnValue, operator, limit) {
    let headers = {'Content-Type': 'application/json'}
    let requestBody = setRequestBody(datastoreId, columnName, columnValue, operator, limit);
    try{
        let response = await postItem('datastore/query', requestBody, headers);
        return response.results;
    }catch (Error){
        console.log("The post could not be fulfilled.");
    }
}

// getDatastoreImport('11196f15-1a77-5b80-97f3-c46c0ce19894').then(r => console.log(r));
datastoreQuery('11196f15-1a77-5b80-97f3-c46c0ce19894', 'domain', "Dental and Oral Health Services",'=', 1).then(r => console.log(r));

export{
    getDatastoreImport,
    datastoreQuery
}