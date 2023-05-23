const base = "https://api.mercadolibre.com";
const search = (search_query) => (base + `/sites/MLA/search?q=${search_query}`);
const items = (id, desc = false) => (base + `/items/${id}` + (desc ? "/description" : ""));
const categories = (id) => (base + `/categories/${id}`);
const currency = (id) => (base + `/currencies${id ? '/' + id : ''}`);

module.exports = {
    search,
    items,
    categories,
    currency
}


