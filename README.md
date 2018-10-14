Tech stack used:
Node v9.9.0
express v4.16.4
MongoDB(via mongoose)

MongoDB hosted using mLab[https://mlab.com/].

Deployment Instructions:

In ticket directory:
node/nodemon main.js

Few improvements that can be done:
1. Better error logging & handling
2. Cache Data --> Session based on cache
3. For storage of past events, we can used archived(field in database) as metadata. After the passage
  of the event, archived is toggled to true. This persists data.
4. A middleware which handles all requests and forwards authenticated ones to respective APIs. 
  Ex : Storing recent IP address used by client to send request can secure website from DDoS attacks.
 