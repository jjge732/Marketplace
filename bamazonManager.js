const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root",
    database: "bamazon"
});

const addProduct = (actions, database) => {
    inquirer.prompt([
        {
            message: 'What is the name of this product?',
            name: 'newProduct'
        }, {
            message: 'In which department is this product?',
            name: 'department'
        }, {
            type: 'number',
            message: 'How much does this product cost the consumer (in dollars)?',
            name: 'price'
        }, {
            type: 'number',
            message: 'How many units of this product are there?',
            name: 'quantity'
        }
    ]).then(res => {
        connection.query('INSERT INTO products SET ?', {
            product_name: res.newProduct,
            department_name: res.department,
            price: res.price,
            stock_quantity: res.quantity
        },
        (err, res) => {
            if (err) throw err;
            console.log(res.affectedRows + " product inserted!\n");
            displayActions(actions, database);
        })
    }).catch(err => {
        console.log(err);
    })
}

const updateProduct = (products, actions, database) => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Which item\'s inventory are you updating?',
            choices: products,
            name: 'item'
        }, {
            type: 'number',
            message: 'What quantity does it now have?',
            name: 'quantity'
        }
    ]).then(res => {
        connection.query('UPDATE products SET ? WHERE ?',
        [
            {
                stock_quantity: parseInt(res.quantity)
            }, {
                item_id: parseInt(res.item[7])
            }
        ],
        (err, res) => {
            if (err) throw err;
            console.log(res.affectedRows + " product updated!\n");
            displayActions(actions, database);
        })
    }).catch(err => {
        console.log(err);
    })
}

const chooseProductListType = (actions, database) => {
    inquirer.prompt([{
        type: 'list',
        message: 'Would you like to select from all products or low stock products?',
        choices: ['All', 'Low stock'],
        name: 'selection'
    }]).then(res => {
        let products = [];
        if (res.selection === 'All') {
            for (let i = 0; i < database.length; i++) {
                products.push('    ID ' + database[i].item_id + ': ' + database[i].product_name);
            }
        } else if (res.selection === 'Low stock') {
            let lowStock = false;
            for (let i = 0; i < database.length; i++) {
                if (database[i].stock_quantity < 10) {
                    products.push('    ID ' + database[i].item_id + ': ' + database[i].product_name + '  quantity: ' + database[i].stock_quantity + ';');
                    lowStock = true;
                }
            }
            if (!lowStock) {
                console.log('No items are low on stock.');
            }
        } else {
            console.log('Choice not supported. Goodbye.')
        }
        updateProduct(products, actions, database);
    }).catch(err => {
        console.log(err);
    })
}

const displayActions = (actions, database) => {
    console.log();
    inquirer.prompt([{
        type: 'list',
        message: 'What would you like to do?',
        choices: actions,
        name: 'chosenAction'
    }]).then(res => {
        switch (res.chosenAction) {
            case actions[0]:
                console.log('  Products for sale:');
                for (let i = 0; i < database.length; i++) {
                    console.log('    ID ' + database[i].item_id + ': ' + database[i].product_name);
                }
                displayActions(actions, database);
                break;

            case actions[1]:
                let lowStock = false;
                for (let i = 0; i < database.length; i++) {
                    if (database[i].stock_quantity < 10) {
                        console.log('    ID ' + database[i].item_id + ': ' + database[i].product_name + '  quantity: ' + database[i].stock_quantity + ';');
                        lowStock = true;
                    }
                }
                if (!lowStock) {
                    console.log('No items are low on stock.');
                }
                displayActions(actions, database);
                break;

            case actions[2]:
                chooseProductListType(actions, database);
                break;

            case actions[3]:
                addProduct(actions, database);
                break;

            //actions can be added before exit without the need to change this code
            case actions[actions.length - 1]:
                console.log('Okay, goodbye.');
                connection.end();
                break;

            default:
                console.log('Support for this command does not exist. Goodbye.')
                break;
        }
    }).catch(err => {
        console.log(err);
    })
}

connection.query('SELECT * FROM products', (err, res) => {
    if (err) throw err;
    let actions = ['View products for sale', 'View low inventory', 'Add to inventory', 'Add new product', 'Exit']
    displayActions(actions, res);
})

