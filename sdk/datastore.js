//https://data.medicaid.gov/api/1/datastore/imports/ {distribution id}
//datastore = distribution
import {fetchItems} from '../sdk.js';

async function getDatastoreImport(datastoreId){
    try {
        return await fetchItems(`datastore/imports/${datastoreId}`);
    } catch (Error){
        console.log("The request could not be fulfilled.");
    }
}
export{
    getDatastoreImport
}