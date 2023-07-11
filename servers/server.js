const express= require('express');
const app=express();
const mysql=require('mysql2');
const dotenv=require('dotenv');
const cors=require('cors');

dotenv.config();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000'
  }));

const connection=mysql.createConnection({
    host:process.env.HOST,
    user:process.env.USER,
    database:process.env.DATABASE,
    password:process.env.PASSWORD
})

connection.connect(err => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the database!');
  });

  app.post('/uploadcars', (req, res) => {
    const { Car_Type, Location, Owner_Name, Owner_Email, Owner_Telephone, Charges_Per_Hour, Charges_Per_Day, Rental_Status, image } = req.body;

    const query = `INSERT INTO car_details (Car_Type, Location, Owner_Name, Owner_Email, Owner_Telephone, Charges_Per_Hour, Charges_Per_Day, Rental_Status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(query, [Car_Type, Location, Owner_Name, Owner_Email, Owner_Telephone, Charges_Per_Hour, Charges_Per_Day, Rental_Status, image], (err, result) => {
      if (err) {
        console.error('Error executing the query:', err);
        res.status(500).json({ error: 'Failed to insert data' });
        return;
      }

      res.status(201).json({ message: 'Data inserted successfully', carId: result.insertId });
    });
  });

  app.listen(4001, () => {
    console.log('Server is listening on port 4001');
  });