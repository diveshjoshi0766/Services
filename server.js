const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const cron = require('node-cron');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(cors()); // Add this line to enable CORS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'diveshjoshi401@gmail.com',
    pass: 'vdhr lxwe qows tlex' // Use environment variables for security in a real application
  }
});

// Routes
app.post('/send-email', (req, res) => {
  const data = req.body;

  // Extract necessary fields for email
  const to = data.to;
  const subject = data.subject;

  // Remove 'to' and 'subject' from the data object
  delete data.to;
  delete data.subject;

  // Convert remaining data to a readable format for the email body
  let emailText = '';
  for (const key in data) {
    emailText += `${key}: ${data[key]}\n`;
  }

  const mailOptions = {
    from: 'diveshjoshi401@gmail.com',
    to: to,
    subject: subject,
    text: emailText
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Email sent successfully');
    }
  });
});

app.get('/heartbeat', (req, res) => {
  console.log("App is up!");
  res.status(200).send('App is up!');
});

cron.schedule('*/5 * * * *', () => {
  console.log('Running a task every 5 minutes');

  fetch(`https://services-o7mq.onrender.com/heartbeat`, {
    method: 'GET'
  })
    .then(response => response.text())
    .then(data => {
      console.log('Response from /trigger-endpoint:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
