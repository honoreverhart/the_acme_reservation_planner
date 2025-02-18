const express = require("express");
const db = require("./db");
const app = express();
app.use(express.json());

app.get("/api/customers", async (req, res, next) => {
  try {
    const result = await db.fetchCustomers();
    res.send(result);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    const result = await db.fetchRestaurants();
    res.send(result);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    const result = await db.getReservations();
    res.send(result);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/customers", async (req, res, next) => {
  try {
    const result = await db.createCustomer(req.body.name);
    res.send(result);
  } catch (ex) {
    next(ex);
  }
});


app.post("/api/reservations", async (req, res, next) => {
    try {
      const {customerName, restaurantName, date, partyCount } = req.body;
      const result = await db.createReservation(customerName, restaurantName, date, partyCount);
      res.send(result);
    } catch (ex) {
      next(ex);
    }
  });

app.delete(
  "/api/customers/:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await db.destroyReservation(req.params.id);
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

const init = async () => {
  await db.init();
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
};

init();
