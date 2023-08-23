import {getItems} from "./httpMethods.js";
async function getDrugContext(rxcui){
    try{
        const response = await getItems(`search=openfda.rxcui.exact:"${rxcui}"`, {blobFlag: false, cacheFlag: true, baseUrl: `https://api.fda.gov/drug/ndc.json?`});
        const result = Array.isArray(response["results"]) ? response["results"] : [response["results"]];
        result.forEach(x => x.source = "FDA-API");
        if (result.length === 1) return result[0];
        return result;
    } catch (error) {
        throw new Error("Drug context isn't available for this drug");
    }
}

export {
    getDrugContext
}

