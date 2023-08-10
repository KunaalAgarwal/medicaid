import {getItems} from './httpMethods.js';

async function getAllDiseases(){
    return (await (await fetch(`https://rxnav.nlm.nih.gov/REST/rxclass/allClasses.json?classTypes=DISEASE`)).json()).rxclassMinConceptList.rxclassMinConcept.sort((a,b) => (a.className > b.className) ? 1 : ((b.className > a.className) ? -1 : 0)).map(row =>row.className)
}

async function diseaseToDrugs(ndcMap, disease){
    var relaSource = "MEDRT"
    var relas = "may_treat"
    var classType = "DISEASE"
    var results={}

    var classIds =  (Object.values(Object.values(await (await fetch(`https://rxnav.nlm.nih.gov/REST/rxclass/allClasses.json?classTypes=${classType}`)).json())[0])[0]).sort((a,b) => (a.className > b.className) ? 1 : ((b.className > a.className) ? -1 : 0))

    results.disease = disease

    var rxnormDrugs =  (await (await fetch(`https://rxnav.nlm.nih.gov/REST/rxclass/classMembers.json?classId=${classIds.filter(row => row.className.includes(disease))[0].classId} &relaSource=${relaSource}&rela=${relas}`)).json()).drugMemberGroup.drugMember.map(el => el.minConcept).sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)).map(row =>row.name)

    results.rxnormDrugs = rxnormDrugs

    var nadacDrugs = rxnormDrugs.map(rxnormDrug => Array.from(ndcMap.keys()).filter(key => {if(key.indexOf(rxnormDrug.toUpperCase()) >= 0) {return key}}) )

// connect rxnorm drugs to nadac drugs by name (nadac drug names that match rxnorm names)
    results.matches = []
    for(let i=0; i < rxnormDrugs.length ; i++){
        var obj = {}
        obj[rxnormDrugs[i]] = nadacDrugs[i];results.matches.push(obj)}

    var nadacNdcsFull = nadacDrugs.map(drugNames => drugNames.map(drugName => Array.from(new Map([...ndcMap].filter(([k,v]) => k==drugName)).values())[0]))

    results.nadacDrugNamesNdcs=[]
    for(let i=0; i < nadacNdcsFull.length ; i++){
        let obj = {}
        for(let j=0; j < nadacNdcsFull[i].length ; j++){
            obj[nadacDrugs[i][j]] =  nadacNdcsFull[i][j]
        }
        results.nadacDrugNamesNdcs.push(obj)
    }

    return results
}

async function getDrugRxCui(drugName) {
    let data = (await getItems(`drugs.json?name=` + drugName, false, 'https://rxnav.nlm.nih.gov/REST/')).drugGroup.conceptGroup;
    let drugs = data.map(o => {
        let res = {tty: o.tty};
        if(Object.values(o).length > 1) {
            res['rxcui'] = o.conceptProperties.map(p => p.rxcui);
        }
        return res})
    return drugs;
}

async function convertRxcuiToNdcs(rxcui) {
    return (await getItems(rxcui + '/ndcs.json', false, 'https://rxnav.nlm.nih.gov/REST/rxcui/')).ndcGroup.ndcList.ndc
}

export {
    getAllDiseases,
    diseaseToDrugs,
    getDrugRxCui,
    convertRxcuiToNdcs
}