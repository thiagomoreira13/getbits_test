# README file for getbits test

Assignment: Bits Senior Software Engineer - Node.js

Bits is planning to help customers build better credit score by leveraging their existing commitments. 
This new product will enable Bits customers to be able to submit their monthly recurring payments from their existing bank account. These recurring payments can be a Netflix Subscription, a Gym Membership or even their Rent. 
By submitting this information to Bits, Bits will be able to create a report on a monthly basis and can add these successful commitments to their customer’s credit file.
You are assigned to design and implement a new API for supporting this new product. Functional and non-functional requirements for this new API are described below. 

Please provide your solution covering the following points:

- API Contracts
- System design using AWS services
- Security & Access Management of API and data
- Implementation of recurring payment data submission endpoint 
- High level plan of how to operate this new API to serve 100K monthly active users

Assessment Points: 

- Use of Javascript, Typescript or Java as your main programming language and providing a GraphQL or REST API
- Use of AWS services for high availability and scalability in system design.
- Clear documentation of your design to your team and product management. 
- Ability to run your solution on local and deploy to AWS
- Maintainable, easy to understand code style and conventions.


-------------------------------
#SOLUTION

This is Node based Serverless component. It is built using Serverless framework `aws-nodejs` template.

To deploy this project, you have to do following:

```
$ serverless deploy -v
```