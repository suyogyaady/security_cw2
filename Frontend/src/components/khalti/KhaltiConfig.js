import axios from 'axios';
import myKey from './khaltiKey';

let config = {
  publicKey: myKey.publicTestKey,
  productIdentity: '1234567890',
  productName: 'Furniture Fusion',
  productUrl: 'http://localhost:3000',
  eventHandler: {
    onSuccess(payload) {
      console.log('payload', payload);
      let data = {
        token: payload.token,
        amount: payload.amount,
      };

      let config = {
        headers: { Authorization: myKey.secretKey },
      };

      axios
        .post('http://localhost:5000/api/payment/verify-payment', data, config)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    onError(error) {
      console.log(error);
    },
    onClose() {
      console.log('widget is closing');
    },
  },
  paymentPreference: [
    'KHALTI',
    'EBANKING',
    'MOBILE_BANKING',
    'CONNECT_IPS',
    'SCT',
  ],
};

export default config;
