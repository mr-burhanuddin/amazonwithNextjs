import { getSession } from 'next-auth/react';
import Order from '../../../models/Order';
import db from '../../../utils/db';

const Razorpay = require('razorpay');
const shortid = require('shortid');

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send('Error: signin required');
  }

  await db.connect();
  const order = await Order.findById(req.query.id);
  await db.disconnect();

  if (req.method === 'POST') {
    // Initialize razorpay object
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    // Create an order -> generate the OrderID -> Send it to the Front-end
    const payment_capture = 1;
    const amount = order.totalPrice * 80;
    const currency = 'INR';
    const options = {
      amount: (amount * 100).toString(),
      currency,
      receipt: shortid.generate(),
      payment_capture,
    };

    try {
      const response = await razorpay.orders.create(options);
      res.status(200).json({
        id: response.id,
        currency: response.currency,
        amount: response.amount,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  } else {
    // Handle any other HTTP method
  }
}
