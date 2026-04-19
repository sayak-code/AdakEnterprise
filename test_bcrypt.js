const bcrypt = require('bcryptjs');
const match = bcrypt.compareSync('AdakAdmin@2024', '$2a$10$QO0T0X1I9lB7yA3C1U1WyeHqJmXl0I7oM/H729q/4J6n6kX6.8W66');
console.log('Match result:', match);
