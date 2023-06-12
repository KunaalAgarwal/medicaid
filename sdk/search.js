import {getItems} from "./httpMethods.js";

async function getSearch(fullText = "", sortProperty = null, sortOrder = null, facets= "", publisher=null, theme = null, keyword = null){
    try{
        let baseEndpoint = `search?fulltext=${fullText}`
        if (sortProperty !== null) {
            baseEndpoint += `&sort=${sortProperty}`
        }
        if (sortOrder !== null){
            baseEndpoint += `&sort-order=${sortOrder}`
        }
        baseEndpoint += `&facets=${facets}`;

        if (publisher !== null){
            baseEndpoint += `&publisher__name=${publisher}`
        }
        if(theme !== null){
            baseEndpoint += `&theme=${theme}`
        }
        if (keyword !== null){
            baseEndpoint += `&keyword=${keyword}`
        }
        console.log(baseEndpoint);
        return await getItems(baseEndpoint)
    }catch(Error){
        console.log("The request could not fulfilled.")
    }
}

async function getSearchFacets(){
    try{
        return await getItems(`search/facets`);
    }catch(Error){
        console.log("The request could not be fulfilled.")
    }
}

// getSearch("", "title", "desc", "",'data.medicaid.gov', null, 'nadac').then(r => console.log(r));

export{
    getSearchFacets,
    getSearch
}