const paypal = require('paypal-rest-sdk');
const HOST = process.env.HEROKU_HOST || "http://localhost:3000";

module.exports.configure = ({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
  });

  
  
module.exports.createPayment = (newDonation) => {
  return create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": `${HOST}/donations/success`,
        "cancel_url": `${HOST}/cancel`
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": newDonation.name,
                "sku": "001",
                "price": newDonation.price,
                "currency": newDonation.currency,
                "quantity": 1
            }]
        },
        "amount": {
            "currency": newDonation.currency,
            "total": newDonation.price
        },
        "description": "Payment"
    }]
  }
}
