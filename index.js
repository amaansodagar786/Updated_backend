//server.js
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
app.use(express.static('assets'));
const cors = require('cors');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser'); // Add this line
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { Console } = require('console');
require('dotenv').config(); // Load environment variables from .env file
app.use(express.json()); // To parse JSON bodies
app.use(bodyParser.json()); // Add this line to parse JSON requests
app.use(cors());
app.use(express.static(path.join(__dirname, 'assets')));


mongoose
  .connect(
    "mongodb+srv://sodagaramaan786:HbiVzsmAJNAm4kg4@cluster0.576stzr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log("mongo error", err));

const registerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: [
    {

      productId: { type: Number },
      quantity: { type: Number, default: 1 },
      productimg: { type: String },
      productname: { type: String },
      productsize: { type: String },
      productprice: { type: Number }

    },
  ],

  wish: [
    {

      productId: { type: Number },
      quantity: { type: Number, default: 1 },
      productimg: { type: String },
      productname: { type: String },
      productsize: { type: String },
      productprice: { type: Number }


    },
  ],
  allorders: [
    {

      productId: { type: Number },
      quantity: { type: Number, default: 1 },
      productimg: { type: String },
      productname: { type: String },
      productsize: { type: String },
      productprice: { type: Number },
      status: { type: String, default: 'pending' }, // Adding status field with default value 'pending'



    },
  ],


  shippingInfo: {
    name: String,
    mobile: String,
    email: String,
    address: String,
    state: String,
    pincode: String,
    landmark: String,
    city: String,
    alternate: String
  }


});

const User = mongoose.model("register", registerSchema);


const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  mobile: {
    type: String,
    requre: true,
  },
  email: {
    type: String,
    requre: true,
  },
  message: {
    type: String,
    requre: true,
  },

});
const User1 = mongoose.model("data", ContactSchema);

const NewsSchema = new mongoose.Schema({

  email: {
    type: String,
    requre: true,
  },


});


const News = mongoose.model("newlater", NewsSchema);


// get data from api
app.get('/api', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');



  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, error: 'Internal Server Error' });
    }

    const jsonData = JSON.parse(data);

    const updatedData = jsonData.map(item => {
      if (item.home_page_route_category_page_img) {
        item.home_page_route_category_page_img = 'http://' + req.get('host') + item.home_page_route_category_page_img;
      }
      item.product_container = item.product_container.map(product => {
        return {
          ...product,
          imgs: 'http://' + req.get('host') + product.imgs,
          first: 'http://' + req.get('host') + product.first,
          second: 'http://' + req.get('host') + product.second,
          third: 'http://' + req.get('host') + product.third
        };
      });
      return item;
    });

    res.json({ success: true, data: updatedData });
  });
});




app.post("/contact", async (req, res) => {
  const { name, mobile, email, message } = req.body;


  try {

    const exist = await User1.findOne({ email, message })

    if (exist) {
      return res.json({ success: false, error: 'you have already messaged..' })
    }

    const result = await User1.create({
      name,
      mobile,
      email,
      message,
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our website',
      html: `
          <p>Hello ${name}</p>
          <p>Thank you for connecting with Us. We are excited to have you on board!</p>
          <p>Best regards,</p>
          <p>Team </p>
        `,


    };




    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);


    res.json({ success: true, message: 'Your message has been sent!' });
    console.log(result);
  } catch (error) {
    res.json({ success: false, error: 'Data not added' })
  }
});

app.post('/newlater', async (req, res) => {
  const { email } = req.body;

  // console.log(email)


  try {

    const existingUserr = await News.findOne({ email });
    const existingRegister = await User.findOne({ email });


    if (existingUserr || existingRegister) {
      return res.json({ success: false, error: 'You are already a Subscriber!!' });
    }



    const result = await News.create({
      email,
    });

    console.log(result);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });



    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank You For Subscribing!',
      html: `
        <p>Thank you for Subscrbing with  View. We are excited to have you on board!</p>
        <p>Best regards,</p>
        <p></p>
        <img src="https://i.ibb.co/qnVVcMk/digital-camera-photo-1080x675.jpg">
      `,


    };



    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({ success: true, message: 'thanks for subscribe' });
  }




  catch (error) {
    console.error('Error during Subscribtion:', error);

    res.json({ success: false, error: 'Internal Server Error' });
  }


});



//get register data

app.post('/register', async (req, res) => {
  const { name, email, mobile, password } = req.body;


  try {

    // Check if the user with the given email already exists
    const existingUser = await User.findOne({ email });







    if (existingUser) {
      // If user exists, return an error response
      return res.json({ success: false, error: 'Email already registered, please do login!' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);





    // add data
    const result = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,

    });

    console.log(result);

    // for newslatter
    const result1 = await News.create({

      email,


    });

    console.log(result1);

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });




    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome ',
      html: `
      <p>Hello ${name}</p>
      <p>Thank you for registering with VHX View. We are excited to have you on board!</p>
      <p>Best regards,</p>
      <img src="https://i.ibb.co/qnVVcMk/digital-camera-photo-1080x675.jpg">
    `,


    };



    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({ success: true, message: 'Registration successful' });
  }




  catch (error) {
    console.error('Error during registration:', error);

    res.json({ success: false, error: 'Internal Server Error' });
  }













});

// Update your login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, error: 'Invalid email' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.json({ success: false, error: 'Invalid  password' });
    }


    // Return user data (in this case, just the name)

    const token = jwt.sign({ email }, 'secret-key', { expiresIn: '10h' });

    console.log(token)
    console.log(user.name)

    // Fetch user's cart items
    const cartItems = user.cart;

    const wishItems = user.wish;

    const shippingInfo = user.shippingInfo || {};

    const accountInfo = {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      password: user.password,
    };

    // Return user data and cart items
    res.json({ success: true, data: token, cartdata: cartItems, wishdata: wishItems, shipping: shippingInfo, accountInfo: accountInfo });
  } catch (error) {
    console.error('Error during login:', error);
  }





});

app.get('/api/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const accountInfo = {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        password: user.password,
      };

      res.json({ accountInfo: accountInfo });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/add-to-cart', async (req, res) => {
  const { productId, productname, productimg, productprice, quantity, productsize } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }



      // Add the product to the user's cart
      user.cart.push({
        productId,
        quantity,
        productname,
        productimg,
        productprice,
        productsize,

      });

      await user.save();

      console.log(user)
      console.log(productId);
      console.log(productsize);

      res.json({ success: true, message: 'Product added to cart', cartItems: user.cart, wishItems: user.wish });
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/cart', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }


      res.json({ cartItems: user.cart });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/remove-from-cart', async (req, res) => {
  const { productId } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOneAndUpdate(
        { email: decoded.email },
        { $pull: { cart: { productId: productId } } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch the updated cart items
      const updatedCartItems = user.cart;

      res.json({ success: true, message: 'Product removed from cart', cartItems: updatedCartItems });
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/increase-quantity', async (req, res) => {
  const { productId } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOneAndUpdate(
        { email: decoded.email, 'cart.productId': productId },
        { $inc: { 'cart.$.quantity': 1 } }, // Increment quantity by 1
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch the updated cart items
      const updatedCartItems = user.cart;

      res.json({ success: true, message: 'Quantity added', cartItems: updatedCartItems });
    });

  } catch (error) {
    console.error('Error increasing quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/decrease-quantity', async (req, res) => {
  const { productId } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOneAndUpdate(
        { email: decoded.email, 'cart.productId': productId },
        { $inc: { 'cart.$.quantity': -1 } }, // Increment quantity by 1
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch the updated cart items
      const updatedCartItems = user.cart;

      res.json({ success: true, message: 'Quantity added', cartItems: updatedCartItems });
    });

  } catch (error) {
    console.error('Error increasing quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/add-to-wish', async (req, res) => {
  const { productId, productname, productimg, productprice, quantity } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }



      // Add the product to the user's cart
      user.wish.push({
        productId,
        productname,
        productimg,
        productprice,
        quantity


      });

      await user.save();

      console.log(user)

      res.json({ success: true, message: 'Product added to Wish', wishItems: user.wish });
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/wish', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send the user's cart items
      res.json({ wishItems: user.wish, cartItems: user.cart });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/remove-from-wish', async (req, res) => {
  const { productId } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOneAndUpdate(
        { email: decoded.email },
        { $pull: { wish: { productId: productId } } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch the updated cart items
      const updatedWishItems = user.wish;

      res.json({ success: true, message: 'Product removed from cart', wishItems: updatedWishItems });
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/save-shipping-info', async (req, res) => {
  const { shippingInfo } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }



      user.shippingInfo = shippingInfo;
      await user.save();


      console.log(user)

      res.json({ success: true, message: 'Shipping information saved successfully' });
    });
  } catch (error) {
    console.error('Error saving shipping information:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/get-user-address', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // You can directly send the shipping information in the response
      const shippingInfo = user.shippingInfo || {};

      res.json({ success: true, data: shippingInfo });
      console.log(shippingInfo)
    });
  } catch (error) {
    console.error('Error fetching user address:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// ACCOUNT INFORMATION UPDATE 



app.post('/update-account-data', async (req, res) => {
  const { name, email, mobile , oldpassword, newpassword } = req.body;

  console.log(name);
  console.log(email);
  console.log(mobile);
  console.log(oldpassword);
  console.log(newpassword);

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    const decoded = jwt.verify(token, 'secret-key');
    
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const passwordMatch = await bcrypt.compare(oldpassword , user.password);

    if (!passwordMatch) {
      return res.status(400).json({ success: false, error: 'Old Password is Not Correct' });
    }

    const Newpassword = await bcrypt.hash(newpassword, 10);


    // Update user's information
    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.password = Newpassword; // Uncomment if password update is handled separately

    // Save the updated user
    await user.save();

    console.log(user.password);

    // Send success response
    res.json({ success: true, message: 'Your Information Has Been Updated' });
  } catch (error) {
    console.error('Error occurred during update:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Send error response
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});







// schedule.scheduleJob('30 17 * 3 5', async () => {
//   try {
// const users = await News.find();

// for (const user of users) {

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const mailOptions = {
//   from: process.env.EMAIL_USER,
//   to: 'jalpunpatel95@gmail.com',
//   subject: ' V-Ex Tech Solution (Weekend Holiday Notice)',
//   html: 'hi',
// };



// const info = await transporter.sendMail(mailOptions);
// console.log('Email sent:', info.response);
// console.log('holiday emails sent successfully');

// }


//   } catch (error) {
// console.error("Error sending birthday emails:", error);
//   }
// });





app.post('/orderdetails', async (req, res) => {
  const orderdetails = req.body;
  console.log('Product details:', orderdetails);
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      try {
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        for (const orders of orderdetails) {
          user.allorders.push(orders);
        }

        await user.save();
        res.json({ success: true, order: user.allorders, message: 'Product details received and saved to user.' });
      } catch (error) {
        console.error('Error saving order details:', error);
        res.status(500).json({ success: false, error: 'Failed to save order details.' });
      }
    });
  } catch (error) {
    console.error('Error handling order details:', error);
    res.status(500).json({ success: false, error: 'Failed to handle order details.' });
  }
});






app.get('/yourorders', async (req, res) => {
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send the user's cart items
      res.json({ Yourorders: user.allorders });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// TRACK ORDERS

app.post('/shipdetails', async (req, res) => {
  const { productId, email, productname } = req.body;
  console.log("Item Shipped & ProductID is ", productId);

  try {
    // Retrieve user information (assuming you have authentication middleware)
    const user = await User.findOne({ email: email }); // Compare email from request body with email in the database
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('user found', user.email);
    // Find the order by product ID and update its status to shipped
    const order = user.allorders.find(order => order.productId === productId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = 'shipped';
    await user.save();

    res.json({ success: true, message: `Product with ID ${productId} is shipped.` });
  } catch (error) {
    console.error('Error shipping product:', error);
    res.status(500).json({ success: false, error: 'Failed to ship product.' });
  }
});


app.post('/deliverdetails', async (req, res) => {
  const { productId, email, productname } = req.body;
  console.log("Item Delivered & ProductID is ", productId);

  try {
    // Retrieve user information (assuming you have authentication middleware)
    const user = await User.findOne({ email: email }); // Compare email from request body with email in the database
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('user found', user.email);
    // Find the order by product ID and update its status to shipped
    const order = user.allorders.find(order => order.productId === productId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = 'delivered';
    await user.save();

    res.json({ success: true, message: `Product with ID ${productId} is deliverd.` });
  } catch (error) {
    console.error('Error shipping product:', error);
    res.status(500).json({ success: false, error: 'Failed to ship product.' });
  }
});

// SEND TRACKING STATUS TO FRONT END 

app.get('/trackinfo', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const ordersWithStatus = user.allorders.map(order => {

        return {
          productId: order.productId,
          status: order.status
        };
      });

      res.status(200).json({ trackinfo: ordersWithStatus });
      console.log(ordersWithStatus);
    });
  } catch (error) {
    console.error('Error fetching track info:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.post('/forgotpassword', async (req, res) => {
  const { name, email } = req.body;
  console.log(name)
  console.log(email)

  try {

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.json({ success: false, error: 'User not found with the provided email' });
    }



    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });




    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Know Your Password Dude',
      html: `
        <p>Hello ${name}</p>
        <p>We know You Forgot your password</p>
        <p> So here Your Password changed link <p>
        <a href="https://e-commerce-vert-iota.vercel.app/forgotpassword"> click here</a> 

        
 
      `,


    };



    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({ success: true, message: 'Email sent successfully' });
  }




  catch (error) {
    console.error('Error during registration:', error);

    res.json({ success: false, error: 'Internal Server Error' });
  }

});

app.post('/changepassword', async (req, res) => {
  const { email , newPassword } = req.body;
  console.log(email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, error: 'User not found with the provided email' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword ;
    await user.save(); 



    return res.json({ success: true, message: 'Password reset email sent successfully' });
  } catch (error) {
    
    console.error(error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
// ADMIN PANEL 


app.get('/newslatter-info', async (req, res) => {

  try {
    const emails = await News.find();
    // console.log(emails)
    res.json({ success: true, data: emails });
  } catch (error) {
    res.json({ success: false, error: 'Failed to retrieve Emails' });
  }
});

app.get("/contact-info", async (req, res) => {
  try {
    const contacts = await User1.find();
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.json({ success: false, error: 'Failed to retrieve contacts' });
  }
});

app.get("/allorders-with-user", async (req, res) => {
  try {
    const orders = await User.find({}, { name: 1, email: 1, allorders: 1 });
    // console.log(orders); // Log the fetched data
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders with user details:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve orders with user details' });
  }
});


app.get('/', (req, res) => {
    res.send('Hello World!');
  });



app.listen(3034, () => {
  console.log('Server connected');
});