const { placeMarketBuyOrderFutures, placeMarketSellOrderFutures, sellFullPosition, buyFullPosition, debug, } = require('./model');

const controller = {
    async editPosition(req, res) {
        let type = req.body.type;
        let symbol = req.body.symbol;
        let quantity = req.body.quantity;
        let orderID = req.body.orderID;

        let apiKey = req.body.apiKey;
        let apiSecret = req.body.apiSecret;

        console.log("Type: ", type);
        console.log("Symbol: ", symbol);
        console.log("Quantity: ", quantity);
        console.log("OrderID: ", orderID);

        //filter symbol for ".P", remove .P from symbol
        let symbolArray = symbol.split(".");
        symbol = symbolArray[0];

        //debug
        //quantity = 1366;


        if(orderID == "Exit Long"){
            sellFullPosition(symbol, apiKey, apiSecret).then(data =>{
                //console.log('Order successful:', data);
                res.send(data);
            }).catch(error => {
                console.error('Order failed:', error);
                res.send(error);
            });
        }   
        else if(orderID == "Exit Short"){
            buyFullPosition(symbol).then(data =>{
                //console.log('Order successful:', data);
                res.send(data);
            }).catch(error => {
                console.error('Order failed:', error);
                res.send(error);
            });
        }
        else if(orderID == "Buy"){
            placeMarketBuyOrderFutures(symbol, quantity, 20).then(data =>{
                //console.log('Order successful:', data);
                res.send(data);
            }).catch(error => {
                console.error('Order failed:', error);
                res.send(error);
            });
        }
        else if(orderID == "Sell"){
            placeMarketSellOrderFutures(symbol, quantity, 20).then(data =>{
                //console.log('Order successful:', data);
                res.send(data);
            }).catch(error => {
                console.error('Order failed:', error);
                res.send(error);
            });
        }



    },
};


module.exports = controller;