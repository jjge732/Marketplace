require('console.table');

const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root",
    database: "bamazon"
});

const createDepartment = (departments, costs) => {
    connection.query('DROP TABLE departments', (err, res) => {
        if (err) throw err;
    })
    connection.query('CREATE TABLE departments (department_id INTEGER(11) AUTO_INCREMENT NOT NULL, department_name VARCHAR(30) NOT NULL, over_head_costs FLOAT(11,2) NOT NULL, PRIMARY KEY(department_id));', (error, response) => {
        if (error) throw error;
    });
    for (let i = 0; i < departments.length; i++) {
            connection.query('INSERT INTO departments SET ?', {
                department_name: departments[i],
                over_head_costs: costs[i]
            },
            (err, res) => {
                if (err) throw err;
            });
    }
    displayOptions();
}

const getDepartmentInfo = () => {
    inquirer.prompt([
        {
            message: 'What is the department called?',
            name: 'name'
        }, {
            message: 'What is this department\'s overhead?',
            name: 'overhead'
        }
    ]).then(response => {
        connection.query('SELECT * FROM departments', (err, res) => {
            if (err) throw err;
            let departments = [], costs = [];
            for (let i = 0; i < res.length; i++) {
                departments.push(res[i].department_name);
                costs.push(res[i].over_head_costs);
            }
            departments.push(response.name);
            costs.push(response.overhead);
            createDepartment(departments, costs);
        });
    }).catch(err => {
        console.log(err);
    })
}

const viewSales = () => {
    // http://www.zentut.com/sql-tutorial/
    let query = 'SELECT departments.department_id, departments.department_name, SUM(products.product_sales) AS product_sales, departments.over_head_costs ';
    query += 'FROM products RIGHT JOIN departments ON products.department_name = departments.department_name GROUP BY departments.department_id';
    connection.query(query, (err, res) => {
        if (err) throw err;
        let table = [];
        for (let i = 0; i < res.length; i++) {
            table.push({
                ...res[i], 
                total_profit: (res[i].product_sales - res[i].over_head_costs).toFixed(2)
            });
        }
        console.log();
        console.table(table);
        console.log('\n *A value of null results from a department that currently contains no products or no sales. \n')
        displayOptions();
    })
}

const displayOptions = () => {
    const options = ['View product sales by department', 'Create new department', 'Exit'];
    inquirer.prompt([{
        type: 'list',
        message: 'Please select an action to perform.',
        choices: options,
        name: 'action'
    }]).then(res => {
        if (res.action === options[0]) {
            viewSales();
        } else if (res.action === options[1]) {
            getDepartmentInfo();
        } else if (res.action === options[options.length - 1]) {
            console.log('Okay, goodbye.');
            connection.end();
        } else {
            console.log('Action not supported. Goodbye.');
            connection.end();
        }
    }).catch(err => {
        console.log(err);
    })
}

connection.connect(err => {
    if (err) throw err;
    displayOptions();    
});