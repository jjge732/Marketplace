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

const displayOptions = () => {
    const options = ['View product sales by department', 'Create new department'];
    inquirer.prompt([{
        type: 'list',
        message: 'Please select an action to perform.',
        choices: options,
        name: 'action'
    }]).then(res => {
        if (res.action === options[0]) {

        } else if (res.action === options[1]) {
            getDepartmentInfo();
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