const express = require('express');
const router = express.Router();
const fetch = require("node-fetch");
const { items, search, categories, currency } = require("./endpoints");
const { authHeaderN_, authHeaderLN_ } = require('./secret');

const getCategoryHierachy = async (res, id) => {
    const category_ = await fetch(categories(id))
        .then(res => res.json())
        .catch(e => res.status(500).send("Ocurrió un error intentado realizar la petición."))
    try {
        if (category_.path_from_root.length)
            return category_.path_from_root.map(e => e.name);
        else
            return [category_.name];
    } catch (error) {
        res.status(500).send("Ocurrió un error intentado realizar la petición.")
    }
}
const groupByProperty = (list, property) => {
    return list.reduce(function (value_, value) {
        (value_[value[property]] = value_[value[property]] || []).push(value);
        return value_;
    }, {});
}
router.get("/items", async (req, res, next) => {
    const { q } = req.query;
    const data = await fetch(search(q))
        .then(async res => res.json())
        .catch(e => res.status(500).send("Ocurrió un error intentado realizar la petición."))
    if (data.results.length) {
        const res_ = groupByProperty(data.results, "category_id")
        let quantity_arr = [];
        for (const category in res_) {
            quantity_arr.push({ key: category, cant: res_[category].length })
        }
        console.log(quantity_arr);
        for (let i = 0; i < quantity_arr.length; i++) {
            for (let j = 0; j < (quantity_arr.length - 1) - i; j++) {
                if (quantity_arr[j].cant > quantity_arr[j + 1].cant) {
                    let piv = quantity_arr[j];
                    quantity_arr[j] = quantity_arr[j + 1];
                    quantity_arr[j + 1] = piv;
                }
            }
        }
        const r_ = quantity_arr.reverse();
        const most_repeated = r_[0].key;
        const hierachy = await getCategoryHierachy(res, most_repeated);
        const currencies = await fetch(currency())
            .then(async res => res.json())
            .catch(e => res.status(500).send("Ocurrió un error intentado realizar la petición."))

        // Incluir la información de la moneda dentro del resultado de la petición
        data.results = data.results.map(element => {
            element["currency_id"] = currencies.filter(e => e.id == element["currency_id"])[0];
            delete element["currency_id"]["description"]
            return element;
        })

        res.send({
            author: {
                name: authHeaderN_,
                lastname: authHeaderLN_
            },
            categories: hierachy,
            items: data.results.map(r => ({
                id: r.id,
                title: r.title,
                price: {
                    currency: r.currency_id.symbol,
                    amount: r.price,
                    decimals: r.currency_id.price
                },
                picture: r.thumbnail,
                condition: r.condition,
                free_shipping: r.shipping.free_shipping,
                city: r.seller_address.city.name
            }))
        });
    } else {
        res.send({
            author: {
                name: authHeaderN_,
                lastname: authHeaderLN_
            },
            categories: [],
            items: []
        })
    }
})
router.get("/items/:id", async (req, res, next) => {
    const { id } = req.params;
    const data = await fetch(items(id))
        .then(async res => res.json())
        .catch(e => res.status(500).send("Ocurrió un error intentado realizar la petición."))
    if (data) {
        const data_desc = await fetch(items(id, true))
            .then(async res => res.json())
            .catch(e => res.status(500).send("Ocurrió un error intentado realizar la petición."))
        const cr = await fetch(currency(data.currency_id))
            .then(async res => res.json())
            .catch(e => res.status(500).send("Ocurrió un error intentado realizar la petición."))
        res.send({
            author: {
                name: authHeaderN_,
                lastname: authHeaderLN_
            },
            item: {
                id: data.id,
                title: data.title,
                price: {
                    currency: cr.symbol,
                    amount: data.price,
                    decimals: cr.decimals_places,
                },
                picture: data.thumbnail,
                condition: data.condition,
                free_shipping: data.shipping.free_shipping,
                sold_quantity: data.sold_quantity,
                description: data_desc.plain_text
            }
        }
        )
    } else
        res.send({
            author: {
                name: authHeaderN_,
                lastname: authHeaderLN_
            }, item: {}
        })
})
router.get("/items/:id/description", async (req, res, next) => {

})
module.exports = router;