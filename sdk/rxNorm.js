import {getItems} from './httpMethods.js';
async function getAllDiseases(diseaseIdMap){
    return [...diseaseIdMap.keys()]
}
async function getRxcuiFromNdc(ndc){
    const response = await getItems(`/REST/rxcui.json?idtype=NDC&id=${ndc}&allsrc=0`,false,"https://rxnav.nlm.nih.gov")
    if (response === undefined) throw new Error("The NDC could not be converted to a Rxcui");
    const result = Array.isArray(response["idGroup"]["rxnormId"]) ? response["idGroup"]["rxnormId"] : [response["idGroup"]["rxnormId"]];
    if (result.length === 1) return result[0];
    return result;
}

async function getNDCsFromRxcui(rxcui){
    const response = await getItems(`/REST/rxcui/${rxcui}/ndcs.json`,false,"https://rxnav.nlm.nih.gov");
    const result = Array.isArray(response["ndcGroup"]["ndcList"]["ndc"]) ? response["ndcGroup"]["ndcList"]["ndc"] : [response["ndcGroup"]["ndcList"]["ndc"]];
    if (result.length === 1) return result[0];
    return result
}

async function getRxcuiProperties(rxcui){
    const response = await getItems(`/REST/rxcui/${rxcui}/allProperties.json?prop=names`,false,"https://rxnav.nlm.nih.gov");
    return response["propConceptGroup"]["propConcept"][0]["propValue"].toUpperCase();
}

async function getDiseaseIdMap(){
    const response = await getItems("/REST/rxclass/allClasses.json?classTypes=DISEASE",false, "https://rxnav.nlm.nih.gov");
    const classes = response["rxclassMinConceptList"]["rxclassMinConcept"];
    return classes.reduce((map, obj) => {
        map.set(obj["className"],obj["classId"]);
        return map;
    }, new Map());
}

async function getRxcuiMembers(classId){
    const response = await getItems(`/REST/rxclass/classMembers.json?classId=${classId}&relaSource=MEDRT&rela=may_treat`,false, "https://rxnav.nlm.nih.gov");
    if (Object.keys(response).length === 0) throw new Error("Could not find any associated drugs for this disease.")
    const drugs = response["drugMemberGroup"]["drugMember"];
    return drugs.map(drug => drug["minConcept"]["rxcui"]);
}

async function getDrugsFromDisease(disease, diseaseIdMap) {
    const diseaseId = diseaseIdMap.get(disease);
    const rxcuis = await getRxcuiMembers(diseaseId);
    return await Promise.all(rxcuis.flatMap(rxcui => getRxcuiProperties(rxcui)));
}

async function getNdcsFromDisease(disease, diseaseIdMap){
    const diseaseId = diseaseIdMap.get(disease);
    const rxcuis = await getRxcuiMembers(diseaseId);
    return await Promise.all(rxcuis.flatMap(rxcui => getNDCsFromRxcui(rxcui)));
}

export {
    getAllDiseases,
    getNDCsFromRxcui,
    getRxcuiFromNdc,
    getDiseaseIdMap,
    getDrugsFromDisease,
    getNdcsFromDisease
}