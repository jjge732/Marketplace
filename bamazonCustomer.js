const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root",
    database: "bamazon"
});

const updateDatabase = (item, amount, total) => {
    connection.query('SELECT * FROM products', (err, res) => {
        if (err) throw err;
        let index = String(item[0]);
        if (item[1] !== ' ') {
            index += item[1];
        }
        index = Number(index);
        index -= 1;
        connection.query('UPDATE products SET ? WHERE ?',
        [
            {
                stock_quantity: res[index].stock_quantity - amount,
                product_sales: res[index].product_sales + total
            }, {
                item_id: index + 1
            }
        ], (err, res => {
            if (err) throw err;
            connection.end();
        }));
});
}

const checkout = (item, cost, amount) => {
    let total = cost * amount;
    let item_name = '';
    console.log(item);
    if (item[1] !== ' ') {
        for (let i = 4; i + 1 < item.length; i++) {
            item_name += item[i];
        }
    } else {
        for (let i = 3; i + 1 < item.length; i++) {
            item_name += item[i];
        }
    }
    inquirer.prompt([{
        type: 'confirm',
        message: `Please confirm your purchase of ${amount} ${item_name}(s) for $${total.toFixed(2)} dollars.`,
        name: 'purchase'
    }]).then(res => {
        if (res.purchase) {
            console.log('Thank you for your purchase! Come again soon!');
            updateDatabase(item, amount, total);
        } else {
            inquirer.prompt([{
                type: 'confirm',
                message: 'Would you like to abandon your checkout?',
                name: 'abandon'
            }]).then(response => {
                if (response.abandon) {
                    console.log('Okay, goodbye.');
                    connection.end();
                    return;
                } else {
                    checkout(item, cost, amount);
                }
            }).catch(error => {
                console.log(error);
            })
        }
    }).catch(err => {
        console.log(err);
    })
}

const purchase = (product_names, product_prices, product_quantity) => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to buy?',
            choices: product_names,
            name: 'item'
        }, {
            type: 'number',
            message: 'How many would you like to buy?',
            name: 'quantity'
        }
    ]).then(response => {
        let index = String(response.item[0]);
        if (response.item[1] !== ' ') {
            index += response.item[1];
        }
        index = Number(index);
        index -= 1;
        if (response.quantity > product_quantity[index]) {
        console.log(`Insufficient quantity, there are only ${product_quantity[index]} in stock.`);
        inquirer.prompt([{
            type: 'confirm',
            message: `Would you like to buy all ${product_quantity[index]}?`,
            name: 'buyAll'
        }]).then(res => {
            if (res.buyAll) {
                checkout(response.item, product_prices[index], product_quantity[index]);
            } else {
                console.log('Okay, goodbye.');
                connection.end();
            }
        }).catch(error => {
            console.log(error);
        })
    } else {
        checkout(response.item, product_prices[index], response.quantity);
    }

    }).catch(error => {
        console.log(error);
    })
}

const displayData = () => {
    connection.query('SELECT * FROM products', (err, res) => {
        if (err) throw err;
        let product_names = [], product_prices = [], product_quantity = [];
        for (let i = 0; i < res.length; i++) {
            product_names.push((i + 1) + ' (' + res[i].product_name + ')');
            product_prices.push(res[i].price);
            product_quantity.push(res[i].stock_quantity);
            console.log(`Item ${product_names[i]} costs $${product_prices[i]} dollars.\n`)
        }
        purchase(product_names, product_prices, product_quantity);
    });
}

connection.connect(err => {
    if (err) throw err;
    displayData();
});