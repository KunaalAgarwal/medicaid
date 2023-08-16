import {getItems} from "./httpMethods.js";
async function getDrugContext(rxcui){
    try{
        const response = await getItems(`search=openfda.rxcui.exact:"${rxcui}"`, false, `https://api.fda.gov/drug/ndc.json?`);
        if (response === undefined) throw new Error("Drug context isn't available for this drug");
        const result = Array.isArray(response["results"]) ? response["results"] : [response["results"]];
        if (result.length === 1) return result[0];
        return result;
    } catch (error) {
        console.log("Drug context isn't available for this drug")
    }
}

export {
    getDrugContext
}

