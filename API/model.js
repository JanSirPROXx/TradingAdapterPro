const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'https://api.binance.com'; //for live trading
const baseUrlFutures = 'https://fapi.binance.com'; //for futures trading                   //https://fapi.binance.com



//API keys
const API_KEY = '';
const API_SECRET = '';



async function placeMarketBuyOrderFutures(symbol, quantity, leverage, apiKey, apiSecret) {
    const endpoint = '/fapi/v1/order'; // Endpoint for placing an order
    
    const data = `symbol=${symbol}&leverage=${leverage}&timestamp=${Date.now()-1000}`; //Data for leverage

    const dataQueryString = `symbol=${symbol}&side=BUY&type=MARKET&quantity=${quantity}&recvWindow=5000&timestamp=${Date.now()-1000}`;
    

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(dataQueryString)
        .digest('hex');

    const url = `${baseUrlFutures}${endpoint}?${dataQueryString}&signature=${signature}`;


    const signatureLev = crypto
        .createHmac('sha256', apiSecret)
        .update(data)
        .digest('hex');
    const urlLev = `${baseUrlFutures}${endpoint}?${data}&signature=${signatureLev}`;



    //leverage-------
    async function setLeverage(symbol, leverage) {
        const data = `symbol=${symbol}&leverage=${leverage}&timestamp=${Date.now()-1000}`;
        const signature = generateSignature(data, apiSecret);
        const endpoint = `/fapi/v1/leverage`;
        
        //console.log('------------------------------- signature:', signature);

        try {
            const response = await axios.post(urlLev, {}, {
                headers: { 'X-MBX-APIKEY': apiKey },
            });
            //console.log('Leverage set:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error setting leverage:', error.response?.data || error.message);
            throw error;
        }
    }//----------------

    try {
        const response = await axios.post(url, null, {
            headers: {
                'X-MBX-APIKEY': apiKey,
            },
        });

        //console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error placing market buy order:', error.response.data);
        throw error;
        return error;
    }
    

}

async function placeMarketSellOrderFutures(symbol, quantity, leverage, apiKey, apiSecret) {
    const endpoint = '/fapi/v1/order'; // Endpoint for placing an order
    
    const data = `symbol=${symbol}&leverage=${leverage}&timestamp=${Date.now()-1000}`; //Data for leverage

    const dataQueryString = `symbol=${symbol}&side=SELL&type=MARKET&quantity=${quantity}&recvWindow=5000&timestamp=${Date.now()-1000}`;
    //const dataQueryString = `symbol=${symbol}&side=BUY&type=MARKET&quantity=${quantity}&recvWindow=5000`;
    //const dataQueryString2 = `symbol=LTCBTC&side=BUY&type=LIMIT&timeInForce=GTC&quantity=0.1&price=0.8&timestamp=${Date.now()}`;

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(dataQueryString)
        .digest('hex');

    const url = `${baseUrlFutures}${endpoint}?${dataQueryString}&signature=${signature}`;


    const signatureLev = crypto
        .createHmac('sha256', apiSecret)
        .update(data)
        .digest('hex');
    const urlLev = `${baseUrlFutures}${endpoint}?${data}&signature=${signatureLev}`;



    //leverage-------
    async function setLeverage(symbol, leverage) {
        const data = `symbol=${symbol}&leverage=${leverage}&timestamp=${Date.now()-1000}`;
        const signature = generateSignature(data, apiSecret);
        const endpoint = `/fapi/v1/leverage`;
        
        //console.log('------------------------------- signature:', signature);

        try {
            const response = await axios.post(urlLev, {}, {
                headers: { 'X-MBX-APIKEY': apiKey },
            });
            //console.log('Leverage set:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error setting leverage:', error.response?.data || error.message);
            throw error;
        }
    }//----------------

    try {
        const response = await axios.post(url, null, {
            headers: {
                'X-MBX-APIKEY': apiKey ,
            },
        });

        //console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error placing market buy order:', error.response.data);
        throw error;
        return error;
    }

}


// ____     ___ __    __       _____ ______  __ __  _____  _____ 
//|    \   /  _]  |__|  |     / ___/|      ||  |  ||     ||     |       
//|  _  | /  [_|  |  |  |    (   \_ |      ||  |  ||   __||   __|    
//|  |  ||    _]  |  |  |     \__  ||_|  |_||  |  ||  |_  |  |_  
//|  |  ||   [_|  `  '  |     /  \ |  |  |  |  :  ||   _] |   _] 
//|  |  ||     |\      /      \    |  |  |  |     ||  |   |  |   
//|__|__||_____| \_/\_/        \___|  |__|   \__,_||__|   |__|   
//                                                               

//sell full position, close position & delet the stoploss orders
async function sellFullPosition(symbol, apiKey, apiSecret) {
    const positionEndpoint = '/fapi/v2/positionRisk';
    const orderEndpoint = '/fapi/v1/order';

 // Prepare the query string to fetch position risk
    const positionQueryString = `symbol=${symbol}&recvWindow=5000&timestamp=${Date.now()}`;
    const positionSignature = crypto
        .createHmac('sha256', apiSecret)
        .update(positionQueryString)
        .digest('hex');
    const positionUrl = `${baseUrlFutures}${positionEndpoint}?${positionQueryString}&signature=${positionSignature}`;

    /////
    async function cancelStopLossOrder(symbol) {
        const openOrdersEndpoint = '/fapi/v1/openOrders';
        const cancelOrderEndpoint = '/fapi/v1/order';
    
        // Prepare the query string to fetch open orders
        const ordersQueryString = `symbol=${symbol}&recvWindow=5000&timestamp=${Date.now()}`;
        const ordersSignature = crypto.createHmac('sha256', apiSecret).update(ordersQueryString).digest('hex');
        const ordersUrl = `${baseUrlFutures}${openOrdersEndpoint}?${ordersQueryString}&signature=${ordersSignature}`;
    
        try {
            const openOrdersResponse = await axios.get(ordersUrl, {
                headers: {
                    'X-MBX-APIKEY': apiKey,
                },
            });
    
            // Find the stop loss order. This example looks for STOP_MARKET orders, adjust as necessary.
            const stopLossOrder = openOrdersResponse.data.find(order => order.type === 'STOP_MARKET');
    
            if (!stopLossOrder) {
                console.log('No stop loss order found for symbol:', symbol);
                return;
            }
    
            // Cancel the stop loss order
            const cancelData = `symbol=${symbol}&orderId=${stopLossOrder.orderId}&recvWindow=5000&timestamp=${Date.now()}`;
            const cancelSignature = crypto.createHmac('sha256', apiSecret).update(cancelData).digest('hex');
            const cancelUrl = `${baseUrlFutures}${cancelOrderEndpoint}?${cancelData}&signature=${cancelSignature}`;
    
            await axios.delete(cancelUrl, {
                headers: {
                    'X-MBX-APIKEY': apiKey,
                },
            });
    
            console.log('Stop loss order canceled successfully');
        } catch (error) {
            console.error('Error canceling stop loss order:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
    ////
    
    
    try {
        // Fetch the current position
        const positionResponse = await axios.get(positionUrl, {
            headers: {
                'X-MBX-APIKEY': apiKey,
            },
        });

        // Assuming positionResponse.data is an array of positions and we're interested in the first one
        const position = positionResponse.data.find(pos => pos.symbol === symbol);
        if (!position || parseFloat(position.positionAmt) === 0) {
            console.log('No open position for symbol:', symbol);
            return;
        }

        // Prepare to sell the full position
        const quantity = Math.abs(parseFloat(position.positionAmt)); // Absolute value in case it's a short position
        const dataQueryString = `symbol=${symbol}&side=SELL&type=MARKET&quantity=${quantity}&recvWindow=5000&timestamp=${Date.now()}`;
        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(dataQueryString)
            .digest('hex');
        const url = `${baseUrlFutures}${orderEndpoint}?${dataQueryString}&signature=${signature}`;

        // Place the sell order
        const response = await axios.post(url, null, {
            headers: {
                'X-MBX-APIKEY': apiKey,
            },
        });


        // Cancel the stop loss order
        try{
            await cancelStopLossOrder(symbol);
        }catch{
            console.log('Error canceling stop loss order');
        }



        console.log('Sell order placed successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in sellFullPosition function:', error.response ? error.response.data : error.message);
        throw error;
        return error;
    }
}

async function buyFullPosition(symbol, apiKey, apiSecret) {
    const positionEndpoint = '/fapi/v2/positionRisk';
    const orderEndpoint = '/fapi/v1/order';

    // Prepare the query string to fetch position risk
    const positionQueryString = `symbol=${symbol}&recvWindow=5000&timestamp=${Date.now()}`;
    const positionSignature = crypto
        .createHmac('sha256', apiSecret)
        .update(positionQueryString)
        .digest('hex');
    const positionUrl = `${baseUrlFutures}${positionEndpoint}?${positionQueryString}&signature=${positionSignature}`;


    async function cancelStopLossOrder(symbol) {
        const openOrdersEndpoint = '/fapi/v1/openOrders';
        const cancelOrderEndpoint = '/fapi/v1/order';
    
        // Prepare the query string to fetch open orders
        const ordersQueryString = `symbol=${symbol}&recvWindow=5000&timestamp=${Date.now()}`;
        const ordersSignature = crypto.createHmac('sha256', apiSecret).update(ordersQueryString).digest('hex');
        const ordersUrl = `${baseUrlFutures}${openOrdersEndpoint}?${ordersQueryString}&signature=${ordersSignature}`;
    
        try {
            const openOrdersResponse = await axios.get(ordersUrl, {
                headers: {
                    'X-MBX-APIKEY': apiKey,
                },
            });
    
            // Find the stop loss order. This example looks for STOP_MARKET orders, adjust as necessary.
            const stopLossOrder = openOrdersResponse.data.find(order => order.type === 'STOP_MARKET');
    
            if (!stopLossOrder) {
                console.log('No stop loss order found for symbol:', symbol);
                return;
            }
    
            // Cancel the stop loss order
            const cancelData = `symbol=${symbol}&orderId=${stopLossOrder.orderId}&recvWindow=5000&timestamp=${Date.now()}`;
            const cancelSignature = crypto.createHmac('sha256', apiSecret).update(cancelData).digest('hex');
            const cancelUrl = `${baseUrlFutures}${cancelOrderEndpoint}?${cancelData}&signature=${cancelSignature}`;
    
            await axios.delete(cancelUrl, {
                headers: {
                    'X-MBX-APIKEY': apiKey,
                },
            });
    
            console.log('Stop loss order canceled successfully');
        } catch (error) {
            console.error('Error canceling stop loss order:', error.response ? error.response.data : error.message);
            throw error;
        }
    }


    try {
        // Fetch the current positions
        const positionResponse = await axios.get(positionUrl, {
            headers: {
                'X-MBX-APIKEY': apiKey,
            },
        });

        // Filter for short positions (positionAmt < 0)
        const shortPositions = positionResponse.data.filter(pos => parseFloat(pos.positionAmt) < 0 && pos.symbol === symbol);

        if (shortPositions.length === 0) {
            console.log('No short positions found for symbol:', symbol);
            return;
        }

        // Loop through all short positions to buy (cover) them
        for (let position of shortPositions) {
            const quantity = Math.abs(parseFloat(position.positionAmt)); // Absolute value to cover the short
            const dataQueryString = `symbol=${symbol}&side=BUY&type=MARKET&quantity=${quantity}&recvWindow=5000&timestamp=${Date.now()}`;
            const signature = crypto
                .createHmac('sha256', apiSecret )
                .update(dataQueryString)
                .digest('hex');
            const url = `${baseUrlFutures}${orderEndpoint}?${dataQueryString}&signature=${signature}`;

            // Place the buy order to cover the short position
            const response = await axios.post(url, null, {
                headers: {
                    'X-MBX-APIKEY': apiKey,
                },
            });

            // Cancel the stop loss order
            try{
                await cancelStopLossOrder(symbol);
            }catch{}



            console.log(`Short position covered successfully for symbol: ${symbol}, quantity: ${quantity}`, response.data);
        }

        return `Completed covering short positions for symbol: ${symbol}.`;
    } catch (error) {
        console.error('Error in buyFullShortPosition function:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function debug(){

    console.log('Debugging...');

    

    const response = await axios.get('http://cat-fact.herokuapp.com/facts');
    console.log(response.data);
    
    return response.data;
}

async function getCurrentPrice(symbol) {
    const endpoint = '/api/v3/ticker/price';
    const dataQueryString = `symbol=${symbol}`;
    const signature = crypto
        .createHmac('sha256', API_SECRET)
        .update(dataQueryString)
        .digest('hex');
    const url = `${BASE_URL}${endpoint}?${dataQueryString}&signature=${signature}&timestamp=${Date.now()-1000}`;

    try {
        const response = await axios.get(url);
        return parseFloat(response.data.price);
    }
    catch (error) {
        console.error('Error getting current price:', error.response.data);
        throw error;
    }
}

async function getPosition(symbol) {
    const endpoint = '/fapi/v2/positionRisk';
    const positionQueryString = `symbol=${symbol}&recvWindow=5000&timestamp=${Date.now()}`;
    const signature = crypto
        .createHmac('sha256', API_SECRET)
        .update(positionQueryString)
        .digest('hex');
    const url = `${baseUrlFutures}${endpoint}?${positionQueryString}&signature=${signature}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'X-MBX-APIKEY': API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting position:', error.response.data);
        throw error;
    }
}

//buy or sell a certain coin, to a certain amount, and set the stop loss to a certain percentage, and take profit to a certain  percentage
async function placeMarketOrder(symbol, quantity, side, stopLossPercentage, takeProfitPercentage) {

    //read the current price of the coin
    //const price = await getCurrentPrice(symbol);

    //get the current positions on the account for the symbol
    const position = await getPosition(symbol);
    console.log('Position:', position);
    
    return 'Order placed +';
}


module.exports = {
    placeMarketBuyOrderFutures,
    placeMarketSellOrderFutures,
    sellFullPosition,
    buyFullPosition,
    debug,
    getCurrentPrice,
    getPosition,
    placeMarketOrder
};

