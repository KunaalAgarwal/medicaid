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
        return await getItems(baseEndpoint)
    }catch(Error){
        console.log("The request could not fulfilled.")
    }
}

async function getSearchFacets(){
    return await getItems(`search/facets`);
}

export{
    getSearchFacets,
    getSearch
}