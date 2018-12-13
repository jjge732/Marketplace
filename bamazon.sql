DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(30) NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    price FLOAT(11,2) NOT NULL,
    stock_quantity INTEGER(11) NOT NULL, 
    PRIMARY KEY(item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('chair', 'furnishings', 24.95, 10),
('table', 'furnishings', 44.95, 6),
('desk', 'furnishings', 33.95, 8),
('plant', 'furnishings', 16.95, 3),
('fork', 'utensils', 2.95, 22),
('spoon', 'utensils', 2.85, 34),
('knife', 'utensils', 3.10, 15),
('washer', 'appliances', 395.95, 8),
('dryer', 'appliances', 405.95, 6),
('range', 'appliances', 595.35, 3);

SELECT * FROM products;
