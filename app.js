const express = require("express")
const bodyParser = require("body-parser")
const engines = require("consolidate")
const paypal = require('paypal-rest-sdk');

const app = express();

app.engine("ejs", engines.ejs);
app.set("views","./views");
app.set("view engine","ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

paypal.configure({
'mode': 'sandbox', //sandbox or live
'client_id': 'Ad4N15x7O_PPT3xWfqRzwjBCA4eqVvIGYwxyUhH4P39eWJUhvCrXR-3DGA_Fiu-pSfZAT6GKAW4VDhKo',
'client_secret': 'EOzXpKvJnptvxdETRE9VJaCU7cCcajxRl2CUoWJwUqfjYWOWBhCqs1BmT4_n44-SmKsYhYbdX355keDY'
});
app.get("/", (req, res) =>{
    res.render('index');
});
app.get("/paypal", (req, res) =>{
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/successPayment",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };
     
     
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
})

app.get('/successPayment',(req,res)=>{
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "1.00"
                }
            }
        ]
    };  
    paypal.payment.execute(paymentId,execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            console.log("get payment response");
            console.log(JSON.stringify(payment));
            res.render('success');
        }
    });
});

app.get('/cancel',(res,req)=>{
    res.render('cancel');
})


app.listen(3000, () =>{
    console.log("Server is running");
})