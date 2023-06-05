Medicaid = (await fetch("https://data.medicaid.gov/api/1/metastore/schemas/dataset/items")).json();
data = (await fetch(`https://data.medicaid.gov/api/1/datastore/query/${Medicaid.find(obj => obj.title === wiki)["identifier"]}/0`)).json()
console.log(data);
async function logJSONData() {
    const response = await fetch("http://example.com/movies.json");
    return await response.json();
}


async function logMedicaidJSONData() {
    const response = await fetch("https://data.medicaid.gov/api/1/metastore/schemas/dataset/items");
    // console.log(response);
    return await response.json();
}



