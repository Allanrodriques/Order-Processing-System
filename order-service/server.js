require("dotenv").config();

const express = require("express");
const cors = require("cors");
const solace = require("solclientjs");
const connectDB = require("../shared/db/mongo");
const Order = require("../shared/models/Order");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());


solace.SolclientFactory.init({
  profile: solace.SolclientFactoryProfiles.version10
});

const session = solace.SolclientFactory.createSession({
  url: process.env.SOLACE_HOST,
  vpnName: process.env.SOLACE_VPN,
  userName: process.env.SOLACE_USERNAME,
  password: process.env.SOLACE_PASSWORD
});

session.on(solace.SessionEventCode.UP_NOTICE, () => {
  console.log("Connected to Solace");
});

session.connect();

app.post("/orders", async (req, res) => {

  const { product, quantity } = req.body;

  const order = {
    event: "OrderCreated",
    orderId: `ORD-${Date.now()}`,
    product,
    quantity
  };

  await Order.create({
  orderId: order.orderId,
  product: order.product,
  quantity: order.quantity,
  status: "CREATED"
});

  const msg = solace.SolclientFactory.createMessage();

  msg.setDestination(
    solace.SolclientFactory.createTopicDestination(
      "orders/created"
    )
  );

  msg.setBinaryAttachment(JSON.stringify(order));

  msg.setDeliveryMode(
    solace.MessageDeliveryModeType.PERSISTENT
  );

  session.send(msg);

  console.log("Published:", order);

  res.json(order);
});

app.get("/orders", async (req, res) => {

  try {

    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to fetch orders",
    });
  }
});


app.listen(3000, () => {
  console.log("Order Service running on port 3000");
});