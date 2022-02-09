'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const R = require('ramda');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit = (event, context, callback) => {
    console.log("Receieved request submit payment details. Event is", event);
    const requestBody = JSON.parse(event.body);
    const fullname = requestBody.fullname;
    const email = requestBody.email;
    const provider = requestBody.provider;
    const dueDate = requestBody.dueDate;
    const paymentValue = requestBody.paymentValue;
    const paymentData = requestBody.paymentData;

    if (typeof fullname !== 'string' || typeof email !== 'string' || typeof provider !== 'string' || typeof dueDate !== 'string' || typeof paymentValue !== 'number' || typeof paymentData !== 'string') {
        console.error('Validation Failed');
        callback(new Error('Couldn\'t submit payment because of validation errors.'));
        return;
    }

    const payment = paymentInfo(fullname, email, provider, dueDate, paymentValue, paymentData);
    const paymentSubmissionFx = R.composeP(submitpaymentP, checkpaymentExistsP);

    paymentSubmissionFx(payment)
        .then(res => {
            console.log(`Successfully submitted ${provider} for ${dueDate} payment to your account`);
            callback(null, successResponseBuilder(
                JSON.stringify({
                    message: `Sucessfully submitted payment`,
                    paymentId: res.id
                }))
            );
        })
        .catch(err => {
            console.error('Failed to submit payment to system', err);
            callback(null, failureResponseBuilder(
                409,
                JSON.stringify({
                    message: `Unable to submit payment`
                })
            ))
        });
};


module.exports.list = (event, context, callback) => {
    console.log("Receieved request to list all payments. Event is", event);
    var params = {
        TableName: process.env.PAYMENT_TABLE,
        ProjectionExpression: "id, fullname, email, provider, dueDate, paymentValue, paymentData"
    };
    const onScan = (err, data) => {
        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, successResponseBuilder(JSON.stringify({
                payments: data.Items
            })
            ));
        }
    };
    dynamoDb.scan(params, onScan);
};

module.exports.get = (event, context, callback) => {
    const params = {
        TableName: process.env.PAYMENT_TABLE,
        Key: {
            id: event.pathParameters.id,
        },
    };
    dynamoDb.get(params)
        .promise()
        .then(result => {
            callback(null, successResponseBuilder(JSON.stringify(result.Item)));
        })
        .catch(error => {
            console.error(error);
            callback(new Error('Couldn\'t fetch payment.'));
            return;
        });
};

const checkpaymentExistsP = (payment) => {
    console.log('Checking if payment already exists...');
    const query = {
        TableName: process.env.PAYMENT_TABLE,
        Key: {
            "email": payment.email,
            "provider": payment.provider,
            "dueDate": payment.dueDate,
        }
    };
    return dynamoDb.get(query)
        .promise()
        .then(res => {
            if (R.not(R.isEmpty(res))) {
                return Promise.reject(new Error('Payment already exists for this provider ' + provider));
            }
            return payment;
        });
}

const submitpaymentP = payment => {
    console.log('submitpaymentP() Submitting payment to system');
    const paymentItem = {
        TableName: process.env.PAYMENT_TABLE,
        Item: payment,
    };
    return dynamoDb.put(paymentItem)
        .promise()
        .then(res => payment);
};


const successResponseBuilder = (body) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: body
    };
};

const failureResponseBuilder = (statusCode, body) => {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: body
    };
};

const paymentInfo = (fullname, email, provider, dueDate, paymentValue, paymentData) => {
    const timestamp = new Date().getTime();
    return {
        id: uuid.v1(),
        fullname: fullname,
        email: email,
        provider: provider,
        dueDate: dueDate,
		paymentValue: paymentValue,
        paymentData: paymentData,
        evaluated: false,
        submittedAt: timestamp,
        updatedAt: timestamp,
    };
};

