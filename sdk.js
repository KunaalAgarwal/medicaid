class MedicaidSDK {
    constructor(){
        this.baseUrl = 'https://data.medicaid.gov/api/1/metastore/schemas/dataset/items';
        this.items = [];
    }

    async fetchItems(){
        if(this.items.length>0){
            return this.items // if cached no need to retrieve again
        }else{
            this.items = await (await fetch(this.baseUrl)).json();
            const loadedAt = `Medicaid SDK loaded at \n${Date()}`;
            console.log(loadedAt);
            return this.items;
        }
    }

    async getItemByTitleName(databaseTitle) {
        const items = await this.fetchItems();
        return items.filter(item => item.title.toLocaleUpperCase() === databaseTitle.toLocaleUpperCase());
    }

    async getItemByKeyword(dbKeyword){
        const items = await this.fetchItems();
        return items.filter(item => item.keyword.some(key => key.toLocaleUpperCase() === dbKeyword.toLocaleUpperCase()));
    }

    async getItemByDescription(dbDescription) {
        const items = await this.fetchItems();
        return items.filter(item => item.description.toLocaleUpperCase() === dbDescription.toLocaleUpperCase());
    }

    async getItemByIdentifier(dbIdentifier) {
        const items = await this.fetchItems();
        return items.filter(item => item.identifier.toLocaleUpperCase() === dbIdentifier.toLocaleUpperCase());
    }

}

// export{
//     MedicaidSDK
// }

let medicaidSDK = new MedicaidSDK();
let s = `Performance rates on frequently reported health care quality measures in the CMS Medicaid/CHIP Child and Adult Core Sets, for FFY 2017 reporting.  Source: Mathematica analysis of MACPro and Form CMS-416 reports for the FFY 2017 reporting cycle. For more information, see the <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/child-core-set/index.html">Children's Health Care Quality Measures</a> and <a href="https://www.medicaid.gov/medicaid/quality-of-care/performance-measurement/adult-core-set/index.html">Adult Health Care Quality Measures</a> webpages.`
medicaidSDK.getItemByDescription(s).then(r => console.log(r[0].title));
medicaidSDK.getItemByIdentifier('c1028fdf-2e43-5d5e-990b-51ed03428625').then(r => console.log(r[0].title));
medicaidSDK.getItemByTitleName('2017 Child and Adult Health Care Quality Measures').then(r => console.log(r[0].title));
medicaidSDK.getItemByKeyword('performance rates').then(r => console.log(r[0].title));





