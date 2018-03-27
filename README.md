{"id":"PAY-3L0565681N849343XLK5CDDQ",
"intent":"sale",
"state":"approved",
"cart":"22G66464PG8763426",
"payer":{
    "payment_method":"paypal",
    "status":"VERIFIED",
    "payer_info":{
        "email":"clearfundingproject-personal-france@gmail.com",
        "first_name":"personalFrance",
        "last_name":"clearfunding",
        "payer_id":"MDQYR35HU7NP2",
        "shipping_address":{
            "recipient_name":"personalFrance clearfunding",
            "line1":"Av. de la Pelouse, 
            87648672 Mayet",
            "city":"Paris",
            "state":"Alsace",
            "postal_code":"75002",
            "country_code":"FR"}
            ,
        "country_code":"FR"}
            },
    "transactions":[
            {"amount":{
                "total":"0.33",
                "currency":"USD",
                "details":{}
                },
            "payee":{
                "merchant_id":"GWF6YSFBJ969A","email":"clearfundingproject-business-italy@gmail.com"
                },
            "description":"Hat for the best team ever",
            "item_list":{
                "items":[
                    {
                        "name":"Fundacion cancer",
                        "sku":"001",
                        "price":"0.33",
                        "currency":"USD",
                        "quantity":1
                    }
                        ],
                "shipping_address":{
                    "recipient_name":"personalFrance clearfunding",
                    "line1":"Av. de la Pelouse, 87648672 Mayet",
                    "city":"Paris",
                    "state":"Alsace",
                    "postal_code":"75002",
                    "country_code":"FR"
                    }
                },
            "related_resources":[
                {
                    "sale":{
                        "id":"1F3304855Y732913A",
                        "state":"completed",
                        "amount":{
                            "total":"0.33",
                            "currency":"USD",
                            "details":{
                                "subtotal":"0.33"
                                }
                            },
                        "payment_mode":"INSTANT_TRANSFER",
                        "protection_eligibility":"ELIGIBLE","protection_eligibility_type":"ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE",
                        "transaction_fee":{
                            "value":"0.31",
                            "currency":"USD"
                            },
                        "parent_payment":"PAY-3L0565681N849343XLK5CDDQ","create_time":"2018-03-27T10:49:12Z",
                        "update_time":"2018-03-27T10:49:12Z",
                        "links":[                       {"href":"https://api.sandbox.paypal.com/v1/payments/sale/1F3304855Y732913A",
                        "rel":"self",
                        "method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/payments/sale/1F3304855Y732913A/refund","rel":"refund","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/payment/PAY-3L0565681N849343XLK5CDDQ","rel":"parent_payment","method":"GET"}]}}]}],"create_time":"2018-03-27T10:49:12Z","links":[{"href":"https://api.sandbox.paypal.com/v1/payments/payment/PAY-3L0565681N849343XLK5CDDQ","rel":"self","method":"GET"}],"httpStatusCode":200}