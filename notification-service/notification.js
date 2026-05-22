require("dotenv").config();

const solace = require("solclientjs");

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
      name: "Q.NOTIFICATION",
      type: solace.QueueType.QUEUE,
    },
    acknowledgeMode: solace.MessageConsumerAcknowledgeMode.CLIENT,
  });

  messageConsumer.on(solace.MessageConsumerEventName.UP, () => {
    console.log("Connected to Q.NOTIFICATION");
  });

  messageConsumer.on(
    solace.MessageConsumerEventName.CONNECT_FAILED_ERROR,
    (e) => {
      console.error("Consumer Error:", e);
    }
  );

  messageConsumer.on(solace.MessageConsumerEventName.DOWN, () => {
    console.log("Consumer Down");
  });

  messageConsumer.on(
    solace.MessageConsumerEventName.MESSAGE,
    (message) => {
      try {
        const order = JSON.parse(message.getBinaryAttachment());

        console.log("\n====================================");
        console.log("ORDER COMPLETED");
        console.log("====================================");

        console.log(`Order ID : ${order.orderId}`);
        console.log(`Product  : ${order.product}`);
        console.log(`Quantity : ${order.quantity}`);
        console.log(`Status   : ${order.status}`);

        if (order.timestamp) {
          console.log(`Time     : ${order.timestamp}`);
        }

        console.log("====================================\n");

        message.acknowledge();

        console.log("Notification Sent");
        console.log("Message Acknowledged\n");

      } catch (err) {
        console.error("Error Processing Message:", err);
      }
    }
  );

  messageConsumer.connect();
}