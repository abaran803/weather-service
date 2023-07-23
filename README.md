
# Real-Time Weather Alert System

Weather alerts are an essential service for people who need to stay informed about weather
conditions in various cities. This project is the backend for a Real-Time
Weather Alert System where users can subscribe to weather updates for specific cities.


## API Reference

#### Subscribe City

```http
  POST /subscribe
```

| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Your Email |
| `city` | `string` | **Required**. Subscribing City |

#### Get Weather History

```http
  GET /history/${email}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**. email for history |

#### Change Weather Update Interval

```http
  GET /changeInterval
```

| Query | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `second`      | `string` | seconds for update Interval |
| `minute`      | `string` | minutes for update Interval |
| `hour`      | `string` | hours for update interval |

#### Activate Alert

```http
  POST /activate/alert
```

| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Your Email |
| `type` | `string` | **Required**. Enter alert type(description) |

Note: You can get the entire list of alert type description here: https://openweathermap.org/weather-conditions


## Run Locally

Install MongoDB community server and start server locally

```base
  Reference: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/
```

Install redis and start the redis server

```base
  Reference: https://linuxhint.com/install-run-redis-windows/
```

Clone the project

```bash
  git clone https://github.com/abaran803/weather-service.git
```

Go to the project directory

```bash
  cd weather-service
```

Add the environment variables in .env file and install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```

Start in development mode

```bash
  npm run dev
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`REDIS_HOST`

`REDIS_PORT`

`REDIS_PASSWORD`

`MONGO_URI`

`API_KEY`

`SENDER_MAIL`

`SENDER_PASS`


## Docker deployment

Docker deployment of a project on GitHub using Docker Compose to build, bring up the services, and take them down.

After cloning the project, build the Docker images defined in the docker-compose.yml file.

```bash
  docker-compose build
```

Once the Docker images are built, you can bring up the services with the following command:

```bash
  docker-compose up -d
```

To stop and remove the running services, use the following command:

```bash
  docker-compose down
```

**Note:** After deployment, no history will available and return empty array. To check the history same time, first subscribe with some accounts(if account will not present, it will create automatically), then change the update interval to few seconds using /changeInterval api, and then check history after that much second.
## Documentation

**Steps to use project**

    1. Create a user and subscribe to a city, by using /subscribe POST API with email and city as body

    2. Wait for the currently applied interval or change the interval to check instantly by using /changeInterval GET API and provide ?second=5 as query to change the interval.
    Note: Don't forget to revert the interval to some hour after checking the project, b/c it will increase the number of API calls to Openweather API.

    3. After that interval, check the history of that account by using /history/{email} GET API.
    Note: It is possible to subscribe more than one city by an account, just call the API /subscribe again with same email and different city

    4. You can activate the alert for different weather conditions by using API /activate/alert. After activating alert, you will get an email with red coloured body content everytime when during weather fetch, the weather condition is same.
    Note: You can get the entire list of alert type description here: https://openweathermap.org/weather-conditions


## API service

Deployed API: https://weather-service-waxr.onrender.com

Localhost: http://localhost:3001

Docker: http://localhost:8080


## Tech Stack

**Server:** Node, Express

**Database:** MongoDB

**Services:** Redis, OpenWeather API

