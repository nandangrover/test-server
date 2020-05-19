<p align="center">
  <img  alt="Voyager Server" height="128px" width="128px" src="https://blog.fullstacktraining.com/content/images/2019/01/GraphQL_Logo.png">
</p>

<h1 align="center"><a href="https://voyager-server.herokuapp.com/">Voyager Server</a></h1>

## Objective
- Creating a test server with sample API calls to mongoDB database
- Host it in heroku

## How to use it?
Signup to get the authentication token:
Go to [this link](https://voyager-server.herokuapp.com/api/graphql).
Use this query to sign up:
```
mutation {
  signup(username:"username", email:"email", password:"password")
}
```
In return you will get an authentication token. Install this [chrome extension](https://chrome.google.com/webstore/detail/modheader/idgpnmonknjnojddfkpgkljpfnnfcklj?hl=en) and enter the token recieved from the above query. The key will contain: `Authorization` and the value will contain: `Bearer ${Your Token}`. The login mutation will return the same token. The token will expire in a day.

All the routes are protected except for the signup and login, so you have to get authenticated before.
Database is documented using voyager and can be explored here: [Database Documentation](https://voyager-server.herokuapp.com)

## Sample Queries/Mutations
Fetch the biggest client of all agencies
```
{
  agencies {
    id,
    Name,
    biggestClient {
      id,
      Name,
      TotalBill
    }
  }
}
```

Add a Client
```
mutation {
  addClient (AgencyId:"5ec2e5cfcc56656bd8735262", Name:"Biggest Client",Email:"email@mail.com", PhoneNumber:666000111,TotalBill:100000000 ) {
    id,
    TotalBill,
    Name
  }
}
```

Update Multiple fields of an Agency at once
```
mutation {
  updateAgency(input: {id: "5ec2e692cc56656bd8735268", Name: "Update Agency Name", State:"Maharashtra"}) {
    id,
    State,
    Name
  } 
}
```
Get a single agency
```
{
  agency(id: "5ec2e692cc56656bd8735268") {
    id,
    Name,
    biggestClient {
      id,
      TotalBill
    }
  }
}
```
Use the graphIQL schema to explore more querying/mutation options.
## Environment
- Node + Mongo + Express + Socket.io + GraphQL
