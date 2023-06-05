const loadedAt = `Medicaid SDK loaded at \n${Date()}`;

let items=[] // caching here

async function getItems(){
    if(items.length>0){
        return items // if cached no need to retrieve again
    }else{
        items = await (await fetch('https://data.medicaid.gov/api/1/metastore/schemas/dataset/items')).json();
        return items;
    }
}

async function getItemByKeyword(dbKeyword){
    let foundItems = [];
    for (let item of await getItems()){
        for (let key of item.keyword){
            if (key.toLocaleUpperCase() === dbKeyword.toLocaleUpperCase()){
                foundItems.push(item);
            }
        }
    }
    return foundItems;
}

async function getItemByTitleName(databaseTitle){
    let foundItems = [];
    for (let item of await getItems()){
        if (item.title.toLocaleUpperCase() === databaseTitle.toLocaleUpperCase()){
            foundItems.push(item);
        }
    }
    return foundItems;
}

async function getItemByDescription(databaseDescription){
    let foundItems = [];
    for (let item of await getItems()){
        if (item.description.toLocaleUpperCase() === databaseDescription.toLocaleUpperCase()){
            foundItems.push(item);
        }
    }
    return foundItems;
}

async function getItemByIdentifier(databaseIdentifier){
    let foundItems = [];
    for (let item of await getItems()){
        if (item.identifier.toLocaleUpperCase() === databaseIdentifier.toLocaleUpperCase()){
            foundItems.push(item);
        }
    }
    return foundItems;
}

export{
    loadedAt,
    items,
    getItems,
    getItemByTitleName,
    getItemByKeyword,
    getItemByIdentifier,
    getItemByDescription
}




