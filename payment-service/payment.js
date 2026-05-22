require("dotenv").config();

const solace = require("solclientjs");
const connectDB = require("../shared/db/mongo");
const Order = require("../shared/models/Order");

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
      name: "Q.PAYMENT",
      type: solace.QueueType.QUEUE,
    },
    acknowledgeMode: solace.MessageConsumerAcknowledgeMode.CLIENT,
  });

  messageConsumer.on(solace.MessageConsumerEventName.UP, () => {
    console.log("Connected to Q.PAYMENT");
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
      console.log("Order Received");
      console.log(order);

      console.log("Processing Payment...");

      const paymentEvent = {
        event: "PaymentCompleted",
        orderId: order.orderId,
        product: order.product,
        quantity: order.quantity,
        status: "PAID",
        timestamp: new Date().toISOString(),
      };

      const msg = solace.SolclientFactory.createMessage();

      msg.setDestination(
        solace.SolclientFactory.createTopicDestination(
          "payments/completed"
        )
      );

      msg.setBinaryAttachment(JSON.stringify(paymentEvent));

      msg.setDeliveryMode(
        solace.MessageDeliveryModeType.PERSISTENT
      );
      
      await Order.updateOne(
        {
            orderId: order.orderId
        },
        {
            status: "PAID"
        }
      );
      console.log(
  `Updated ${order.orderId} -> PAID`
);
      session.send(msg);

      console.log("Payment Completed");
      console.log(paymentEvent);

      message.acknowledge();

      console.log("Message Acknowledged");
      console.log("====================\n");

    } catch (err) {
      console.error("Error Processing Message:", err);
    }
  });

  messageConsumer.connect();
}