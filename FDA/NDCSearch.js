// request API

let searchedApproval = "";
let pharmClass = "";
let searchCount ="";
let activeIngredients ="";
let strength = "";
let route = "";
let dosageForm = "";
let TE = ""; 
let NDC = "";

createAutoComplete({
    // where to render autocomplete
    root: document.querySelector('.autocompleteNDCSearch'),
    // how to show individual item
    renderOption(itemSearch) {
    //     const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
    //     return `
    //     <img src="${imgSrc}"/>
    //     ${movie.Title} (${movie.Year})
    //   `
    // console.log(movie);
    return `${itemSearch.generic_name} ${itemSearch.dosage_form} (${itemSearch.brand_name}) ${itemSearch.application_number} NDC: ${itemSearch.product_ndc} `; 
    },
    // what to do when clicked
    onOptionSelect(itemSearch) {
        onSearchSelect(itemSearch);
    },
    // what to backfill after clicked
    inputValue(itemSearch) {
        searchedApproval = itemSearch.application_number;
        NDC = itemSearch.product_ndc;
        console.log(itemSearch);
        return `${itemSearch.generic_name} ${itemSearch.dosage_form} (${itemSearch.brand_name}) ${itemSearch.application_number} NDC: ${itemSearch.product_ndc} `; 
    },
    // how to fetch data 

    async fetchData(searchTerm) {
        const response = await axios.get('https://api.fda.gov/drug/ndc.json?search=' + `product_ndc:${searchTerm}+active_ingredients.name:${searchTerm}+brand_name:${searchTerm}+application_number:${searchTerm}+generic_name:${searchTerm}&limit=30`);
        // let searchRemoveUni = response.data.results[0].generic_name.replace(" ", "+");
        // console.log(response.data.results);
        return response.data.results
      }
});

createAutoComplete({
    // where to render autocomplete
    root: document.querySelector('.autocompleteDrugsFDA'),
    // how to show individual item
    renderOption(itemSearch) {
    //     const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
    //     return `
    //     <img src="${imgSrc}"/>
    //     ${movie.Title} (${movie.Year})
    //   `
    // console.log(movie);
    return `${itemSearch.openfda.generic_name} (${itemSearch.openfda.brand_name[0]}) ${itemSearch.application_number} NDC:${itemSearch.openfda.product_ndc}`; 
    },
    // what to do when clicked
    onOptionSelect(itemSearch) {
        onOpenFdaSearchSelect(itemSearch);
        // console.log(itemSearch);
    },
    // what to backfill after clicked
    inputValue(itemSearch) {
        searchedApproval = itemSearch.application_number;
        console.log(itemSearch);
        pharmClass = itemSearch.openfda.pharm_class_epc ? itemSearch.openfda.pharm_class_epc : '';
        NDC = itemSearch.product_ndc;
        return `${itemSearch.openfda.generic_name} (${itemSearch.openfda.brand_name[0]}) ${itemSearch.application_number} NDC:${itemSearch.openfda.product_ndc}`; 
    },
    // how to fetch data 

    async fetchData(searchTerm) {
        const response = await axios.get('https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:' + `${searchTerm}+application_number:${searchTerm}+openfda.generic_name:${searchTerm}+openfda.product_ndc:${searchTerm.replace('-', '+AND+')}&limit=30`);
        // let searchRemoveUni = response.data.results[0].generic_name.replace(" ", "+");
        // console.log(response.data.results);
        return response.data.results
      }
});

const onSearchSelect = async itemSearch => {
    // console.log(itemSearch);
    const response = await axios.get('https://api.fda.gov/drug/ndc.json?search=' + `(${itemSearch.generic_name.replace(' ', '+AND+')})&limit=400`);
    // need to ADD drugsfda search bar
    // const responseAppNum = await axios.get('https://api.fda.gov/drug/drugsfda.json?search=application_number:' + `(${searchedApproval})&limit=1`);
    // console.log(responseAppNum);
    searchCount = response.data.meta.results.total;
    document.querySelector('#summary').innerHTML = itemSearchNDC(response.data.results);
    runComparison();
};

const onOpenFdaSearchSelect = async itemSearch => {
    // console.log(itemSearch.openfda.generic_name);
    const response = await axios.get('https://api.fda.gov/drug/drugsfda.json?search=' + JSON.stringify(itemSearch.openfda.generic_name[0]) +'&limit=400');
    // need to ADD drugsfda search bar
    // const responseAppNum = await axios.get('https://api.fda.gov/drug/drugsfda.json?search=application_number:' + `(${searchedApproval})&limit=1`);
    // console.log(itemSearchDrugsFDA);
    activeIngredients = itemSearch.openfda.substance_name.toString();
    searchCount = response.data.meta.results.total;
    document.querySelector('#summary').innerHTML = itemSearchDrugsFDA(response.data.results);
    runComparison();
    runIngredientComparison();
};

const runComparison = () => {
    const approvalNumber = document.querySelectorAll(".notification");
    for (i = 0; i < (approvalNumber.length - 1); i++){
        if (approvalNumber[i].innerText.indexOf(searchedApproval) >= 0) {
            document.querySelectorAll(".notification")[i].classList.add('is-warning');
          };
    }
};

const runIngredientComparison = () => {
    const productsTable = document.querySelectorAll("#activeIngredients");
    for (i = 0; i < (productsTable.length - 1); i++){
        if (productsTable[i].innerText === activeIngredients && activeIngredients !== undefined) {
            document.querySelectorAll("#activeIngredients")[i].style.backgroundColor = 'yellow';
            };
    }
};

// DRUGS@FDA Search ************************************************

const itemSearchDrugsFDA = (itemSearchDetail) => {
    let allSearchResultsTable = "";
    let allSearchResults = (allSearchResults) => {

        for (let searchResult of itemSearchDetail){
            if (searchResult.openfda === undefined){
                searchResult.openfda = "";
            };
            if (searchResult.openfda.spl_set_id === "undefined"){
                searchResult.openfda.spl_set_id = "";
            };
            if (searchResult.openfda.unii === "undefined"){
                searchResult.openfda.unii = ""
            }
            if (searchResult.application_number === undefined){
                searchResult.application_number = ""
            }
            if (searchResult.substance_name  === undefined){
                searchResult.substance_name = [{
                    name: "",
                }];
            }
            let DrugDirectory = "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid="; 
            if (searchResult.application_number.indexOf("BLA") < 0 && searchResult.application_number.indexOf("NDA") < 0){
                DrugDirectory = "https://www.accessdata.fda.gov/scripts/cder/ndc/dsp_searchresult.cfm?";
            }
            if (searchResult.submissions === undefined){
                searchResult.submissions = ""
            }

            let fdaDocuments = [];
            for (let submission of searchResult.submissions){
                if (submission.application_docs === undefined){
                    submission.application_docs = ""
                }
                // console.log(submission.application_docs);
                if (submission.submission_type === 'ORIG'){
                    fdaDocuments = submission.application_docs;
                }
            } 

            let letter = "";
            for (fdaDocument of fdaDocuments){
                let {url, date, type} = fdaDocument;
                letter = letter + `
                <a href="${url}" target="_blank">${date} - ${type}</a><br>
                `
                        }            

            let productTable = "";
            let products = searchResult.products;
            for (let productNumber of products){
                let allStrength = "";
                for (let activeIngredientStrength of productNumber.active_ingredients){
                    let {strength} = activeIngredientStrength;
                    allStrength = `${strength} \n ${allStrength}`
                }
                productTable = productTable +
                `
                <tr class="notification">
                <td><a href="https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${(searchResult.application_number).slice(-6)}" target="_blank">${searchResult.application_number}</a></td>
                <td id="activeIngredients"><a href="https://drugs.ncats.io/drug/${searchResult.openfda.unii}" target="_blank">${searchResult.openfda.substance_name}</a></td>
                <td>${searchResult.sponsor_name}</td>
                <td>${searchResult.openfda.manufacturer_name}</td>  
                <td>${productNumber.brand_name}</td>
                <td>${allStrength}</td>
                <td>${productNumber.route}</td>
                <td>${productNumber.dosage_form}</td>
                <td>${productNumber.marketing_status}</td>
                <td id="orangeBook">${productNumber.te_code}</td>
                <td>${productNumber.reference_drug}</td>
                <td>${productNumber.reference_standard}</td>
                <td>${letter}</td>
                </tr>
                `
            } 
            allSearchResultsTable = allSearchResultsTable + productTable;

        }
        
    }
    allSearchResults();

    let searchRows = "";
    for (var i = 0; i < 13 ; i++){
        searchRows = searchRows + `<td><input type="text" id="myInput" onkeyup="tableSearch(0)" placeholder="Search" title="Type in a name" style="width: 100%"></td>`
    }

    return `
        <div class = "media-content">
        <div class = "content">
            <h1> ${itemSearchDetail[0].openfda.generic_name}</h1>
            <h4>${searchedApproval}</h4>
            <h4>${pharmClass}</h4>
            <h5>Search Count = ${searchCount}</h5>
        </div>
        </div>
        
        <table id="drugTable">
            <tr>
                <th onclick="sortTable(0)" id="approval">Approval</th>	
                <th onclick="sortTable(1)" id="ingredients">Ingredient</th>
                <th onclick="sortTable" id="sponsor">Sponsor</th>
                <th onclick="sortTable" id="labeler">Labeler</th>
                <th id="brandTable">Brand</th>
                <th id="strengthTable">Strength</th>
                <th>Route</th>
                <th>DF</th>
                <th>Approval</th>
                <th>TE</th>
                <th>REF</th>
                <th>RS</th>
                <th>Letter</th>
            </tr>
            <tr>
               ${searchRows}
            </tr>
            ${allSearchResultsTable}

        </table>

    `
}


// NDC Search ************************************************

const itemSearchNDC = (itemSearchDetail) => {
    // Combine all active ingredients and strength 
    let allIngredient = "";
    const activeIngredients = (activeIngredients) => {
        for (let i = 0; i < itemSearchDetail[0]["active_ingredients"].length; i++){
            allIngredient = `${allIngredient} ${itemSearchDetail[0]["active_ingredients"][i]["name"]} (${itemSearchDetail[0].active_ingredients[i]["strength"]})<br>`;
        }
    };
    activeIngredients();

    // iterate over searches

    let allSearchResultsTable = "";
    let allSearchResults = (allSearchResults) => {

        for (let searchResult of itemSearchDetail){
            if (searchResult.openfda.spl_set_id === undefined){
                searchResult.openfda.spl_set_id = "";
            };
            if (searchResult.openfda.unii === undefined){
                searchResult.openfda.unii = ""
            }
            if (searchResult.application_number === undefined){
                searchResult.application_number = ""
            }
            if (searchResult.active_ingredients  === undefined){
                searchResult.active_ingredients = [{
                    name: "",
                    strength: "",
                }];
            }

            let splListing = searchResult.openfda.spl_set_id[0]; 
            if (searchResult.openfda.spl_set_id[0] === undefined){
                splListing = searchResult.spl_id;
            }

            let allActiveIngredients = "";
            for (let activeIngredient of searchResult.active_ingredients){
                let {name, strength} = activeIngredient;
                allActiveIngredients += `<b>${name}</b> (${strength}) <br>`
            }


            allSearchResultsTable = 
            allSearchResultsTable + 
            `
            <tr class="notification">
            <td><a href="https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${(searchResult.application_number).slice(-6)}" target="_blank">${searchResult.application_number}</a></td>
            <td><a href="https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${splListing}" target="_blank">${searchResult.product_ndc}</a></td>
            <td>${searchResult.marketing_start_date}</td>
            <td>${searchResult.brand_name}</td>
            <td>${searchResult.generic_name}</td>
            <td><a href="https://drugs.ncats.io/drug/${searchResult.openfda.unii[0]}" target="_blank">${allActiveIngredients}</a></td>
            <td>${searchResult.labeler_name}</td>
            <td>${searchResult.product_type}</td>
            <td>${searchResult.marketing_category}</td>
            <td>${searchResult.route}</td>
            <td>${searchResult.dosage_form}</td>
            </tr>
            `  
        }
        
    }
    allSearchResults();

    let searchRows = "";
    for (var i = 0; i < 11 ; i++){
        searchRows = searchRows + `<td><input type="text" id="myInput" onkeyup="tableSearch(0)" placeholder="Search" title="Type in a name" style="width: 100%"></td>`
    }

    return `
        <div class = "media-content">
        <div class = "content">
            <h1> ${itemSearchDetail[0].generic_name}</h1>
            <h4>${searchedApproval}</h4>
            <h4>${itemSearchDetail[0].pharm_class}</h4>
            <h5>Search Count = ${searchCount}</h5>
        </div>
        </div>
        
        <table id="drugTable">
            <tr>
            <th onclick="sortTable(0)">Approval</th>
            <th onclick="sortTable(1)"><a href="https://www.accessdata.fda.gov/scripts/cder/ndc/dsp_searchresult.cfm?" target="_blank">NDC</a></th>
            <th onclick="sortTable(2)">Date</th>
            <th onclick="sortTable(3)">Name</th>
            <th onclick="sortTable(3)">Generic</th>
            <th onclick="sortTable(4)">Ingredients</th>
            <th onclick="sortTable(5)">Labeler</th>
            <th onclick="sortTable(6)">Type</th>
            <th onclick="sortTable(7)">Marketing</th>
            <th onclick="sortTable(8)">Route</th>
            <th onclick="sortTable(9)">DF</th>
            </tr>
            <tr>
               ${searchRows}
            </tr>
            ${allSearchResultsTable}
        </table>
    `
}

