const pg = require("pg");
const uuid = require("uuid");
const client = new pg.Client(
  "postgres://Honor:Ephesians4:29@localhost:5432/acme_dining_db"
);

const createCustomer = async (customerName) => {
  const SQL = `
    INSERT INTO customers(id, name) VALUES($1, $2) RETURNING *`;
  const result = await client.query(SQL, [uuid.v4(), customerName]);
  return result.rows[0];
};

const createRestaurant = async (restaurantName) => {
  const SQL = `
      INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *`;
  const result = await client.query(SQL, [uuid.v4(), restaurantName]);
  return result.rows[0];
};

const createReservation = async (
  customerName,
  restaurantName,
  date,
  partyCount
) => {
  const SQL = ` 
    INSERT INTO reservations(id, date, party_count, restaurant_id, customer_id) VALUES($1, $2, $3,
     (SELECT id FROM restaurants WHERE name =$4), (SELECT id FROM customers WHERE name =$5))  RETURNING *`;
  const result = await client.query(SQL, [
    uuid.v4(),
    date,
    partyCount,
    restaurantName,
    customerName,
  ]);
  return result.rows[0];
};

const fetchCustomers = async () => {
  const SQL = `
        SELECT * FROM customers
    `;
    const response = await client.query(SQL);
    return response.rows;
};

const fetchRestaurants = async () => {
    const SQL = `
          SELECT * FROM restaurants
      `;
      const response = await client.query(SQL);
      return response.rows;
};

const destroyReservation = async (reservationId) => {
    const SQL = `
    DELETE FROM reservations WHERE id = $1;
    `;
    await client.query(SQL, [reservationId]);
}


const init = async () => {
  await client.connect();
  const SQL = `
        DROP TABLE IF EXISTS reservations;
        DROP TABLE IF EXISTS customers;
        DROP TABLE IF EXISTS restaurants;


        CREATE TABLE restaurants(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL
        );
        CREATE TABLE customers(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL
        );
        CREATE TABLE reservations(
        id UUID PRIMARY KEY,
        date DATE NOT NULL,
        party_count INTEGER NOT NULL,
        restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
        customer_id UUID REFERENCES customers(id) NOT NULL
        );
        
    `;

  await client.query(SQL);
  console.log("db initialized");
  const customerNames = ["Bob", "Jane", "Jerry"];
  const restaurantNames = ["Nobu", "76", "Chili's"];

  await Promise.all(
    customerNames.map(async(name) => {
        await createCustomer(name);
        console.log("customer created: " + name)
    })
  );

  await Promise.all(
    restaurantNames.map(async(name) => {
        await createRestaurant(name);
        console.log("restaurant created: " + name)
    })
  );

  await createReservation("Bob", "Nobu", "2025-02-14", 2);
  await fetchCustomers();
  await fetchRestaurants();
  await destroyReservation();

};

module.exports = {
  init,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomers,
  fetchRestaurants, 
  destroyReservation

};
