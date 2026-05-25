import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "http://35.254.143.197:3000/orders"
      );

      setOrders(response.data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {

    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);

  }, []);

  const createOrder = async () => {
    try {

      await axios.post(
        "http://35.254.143.197:3000/orders",
        {
          product,
          quantity,
        }
      );

      setProduct("");
      setQuantity(1);

      fetchOrders();

    } catch (err) {
      console.error(err);
    }
  };

  const getStatusClass = (status) => {

    switch (status) {

      case "PAID":
        return "paid";

      case "RESERVED":
        return "reserved";

      case "SHIPPED":
        return "shipped";

      default:
        return "created";
    }
  };

  return (
    <div className="container">
      <h1> Allan's Order Processing System</h1>

      <div className="form">

        <input
          type="text"
          placeholder="Product Name"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <button onClick={createOrder}>
          Create Order
        </button>

      </div>

      <table>

        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>

          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.orderId}</td>
              <td>{order.product}</td>
              <td>{order.quantity}</td>

              <td>
                <span className={getStatusClass(order.status)}>
                  {order.status}
                </span>
              </td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default App;
