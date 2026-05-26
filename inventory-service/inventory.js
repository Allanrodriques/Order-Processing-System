require("./tracing");
require("dotenv").config();

const solace = require("solclientjs");

const connectDB = require("./shared/db/mongo");
const Order = require("./shared/models/Order");

connectDB();

solace.SolclientFactory.init({
  profile: solace.SolclientFactoryProfiles.version10,
});

const session = solace.SolclientFactory.createSession({
  url: process.env.SOLACE_HOST,
  vpnName: process.env.SOLACE_VPN,
  userName: process.env.SOLACE_USERNAME,
  password: process.env.SOLACE_PASSWORD,
});

session.on(solace.SessionEventCode.UP_NOTICE, () => {
  console.log("Connected to Solace");

  startConsumer();
});

session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (err) => {
  console.error("Connection Failed:", err);
});

session.connect();

function startConsumer() {
  const messageConsumer = session.createMessageConsumer({
    queueDescriptor: {
      name: "Q.INVENTORY",
      type: solace.QueueType.QUEUE,
    },
    acknowledgeMode: solace.MessageConsumerAcknowledgeMode.CLIENT,
  });

  messageConsumer.on(solace.MessageConsumerEventName.UP, () => {
    console.log("Connected to Q.INVENTORY");
  });

  messageConsumer.on(solace.MessageConsumerEventName.CONNECT_FAILED_ERROR, (e) => {
    console.error("Consumer Error:", e);
  });

  messageConsumer.on(solace.MessageConsumerEventName.DOWN, () => {
    console.log("Consumer Down");
  });

  messageConsumer.on(solace.MessageConsumerEventName.MESSAGE, async (message) => {
    try {
      const order = JSON.parse(message.getBinaryAttachment());

      console.log("\n====================");
      console.log("Inventory Received");
      console.log(order);

      console.log("Reserving Inventory...");

      const inventoryEvent  = {
        event: "InventoryReserved",
        orderId: order.orderId,
        product: order.product,
        quantity: order.quantity,
        status: "RESERVED",
        timestamp: new Date().toISOString(),
      };

      const msg = solace.SolclientFactory.createMessage();

      msg.setDestination(
        solace.SolclientFactory.createTopicDestination(
          "inventory/reserved"
        )
      );

      msg.setBinaryAttachment(JSON.stringify(inventoryEvent));

      msg.setDeliveryMode(
        solace.MessageDeliveryModeType.PERSISTENT
      );

      await Order.updateOne(
        {
            orderId: order.orderId
        },
        {
            status: "RESERVED"
        }
      );
      console.log(
  `Updated ${order.orderId} -> RESERVED`
);

      session.send(msg);

      console.log("Inventory Reserved");
      console.log(inventoryEvent);

      message.acknowledge();

      console.log("Message Acknowledged");
      console.log("====================\n");

    } catch (err) {
      console.error("Error Processing Message:", err);
    }
  });

  messageConsumer.connect();
}
