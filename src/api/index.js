const http = require("http");
const { join } = require('path');
const { once } = require("events");
const carDatabase = join(__dirname, "./../../database", "cars.json");
const CarService = require("../service/carService");

const carService = new CarService({ cars: carDatabase });

const routes = {
  "/available-cars:post": async (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    const body = JSON.parse(await once(request, "data"));
    const car = await carService.getAvailableCar(body);
    response.write(JSON.stringify(car));
    return response.end();
  },
  "/rent-a-car:post": async (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    const body = JSON.parse(await once(request, "data"));
    const { customer, carCategory, numberOfDays } = body;
    const transaction = await carService.rent(customer, carCategory, numberOfDays);
    response.write(JSON.stringify(transaction));
    return response.end();
  },
  "/calculate-final-price:post": async (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    const body = JSON.parse(await once(request, "data"));
    const { customer, carCategory, numberOfDays } = body;
    const finalPrice = carService.calculateFinalPrice(customer, carCategory, numberOfDays);
    response.write(JSON.stringify(finalPrice));
    return response.end();
  },
  default: (request, response) => {
    response.writeHead(404);
    response.write("Not found!");
    return response.end();
  },
};

function handler(request, response) {
  const { url, method } = request;
  const routeKey = `${url}:${method}`.toLowerCase();
  const chosen = routes[routeKey] || routes.default;
  return chosen(request, response);
}

const app = http
  .createServer(handler)
  .listen(3000, () => console.log("Listening at port 3000"));

module.exports = app;
