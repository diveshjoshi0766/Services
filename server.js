const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const fetch = require('node-fetch');

const app = express();

app.use(cors()); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'diveshjoshi401@gmail.com',
    pass: 'vdhr lxwe qows tlex'
  }
});

// Routes
app.post('/upload-file', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded');
  }
  res.status(200).json({ message: 'File uploaded successfully', filePath: file.path });
});

app.post('/send-email', (req, res) => {
  const data = req.body;
  const { email_id, subject, filePath } = data;

  delete data.subject;
  delete data.filePath;

  let emailText = '';
  for (const key in data) {
    emailText += `${key}: ${data[key]}\n`;
  }
  const mailOptions = {
    from: 'diveshjoshi401@gmail.com',
    to: email_id,
    subject: subject,
    text: emailText,
    attachments: filePath ? [{ path: filePath }] : []
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Error sending email', error: error.message });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ success: true, message: 'Email sent successfully' });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
