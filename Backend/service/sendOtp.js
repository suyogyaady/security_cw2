const axios = require('axios');
const sentOtp = async (phone, otp) => {
  // setting state
  let isSent = false;
  //url to send data
  const url = 'https://api.managepoint.co/api/sms/send';
  //payload to send
  const payload = {
    apiKey: 'ba1e3649-ff91-4a1c-ac6b-4911cd297d3d',
    to: phone,
    message: `Your OTP is ${otp}`,
  };
  try {
    const res = await axios.post(url, payload);
    if (res.status === 200) {
      isSent = true;
    }
  } catch (error) {
    console.log('Error Sending OTP', error.message);
  }
  return isSent;
};

module.exports = sentOtp;
