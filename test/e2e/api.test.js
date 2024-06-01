const { describe, it, before, after } = require("mocha");
const { expect } = require("chai");
const { join } = require("path");
const supertest = require("supertest");
const carDatabase = join(__dirname, "./../../database", "cars.json");

const CarService = require("./../../src/service/carService");
const Transaction = require("./../../src/entities/transaction");

const mocks = {
  validCarCategory: require("./../mocks/valid-carCategory.json"),
  validCar: require("./../mocks/valid-car.json"),
  validCustomer: require("./../mocks/valid-customer.json"),
};

describe("API Suite Test", () => {
  let app;

  before((done) => {
    app = require("../../src/api/index");
    app.once("listening", done);
  });

  after((done) => app.close(done));

  describe("/rent-a-car:post", () => {
    it("given a customer, a car category and number of days it should return a transaction receipt", async () => {
      const car = mocks.validCar;

      const carCategory = { ...mocks.validCarCategory, carIds: [car.id] };

      const customer = { ...mocks.validCustomer, age: 50 };

      const numberOfDays = 5;

      const body = {
        customer,
        carCategory,
        numberOfDays,
      };

      const expectedStructure = new Transaction({
        customer,
        car,
        amount: 0,
        dueDate: new Date(),
      });

      const response = await supertest(app)
        .post("/rent-a-car")
        .send(body)
        .expect(200);

      //same structure
      expect(Object.keys(response.body)).to.be.deep.equal(
        Object.keys(expectedStructure)
      );

      expect(response.body.customer).to.be.deep.equal(
        expectedStructure.customer
      );
      expect(response.body.car).to.be.deep.equal(expectedStructure.car);
      expect(response.body.amount).to.be.not.empty;
      expect(response.body.dueDate).to.be.not.empty;
    });
  });

  describe("/available-cars:post", () => {
    it("given a carCategory should return an available car", async () => {
      const car = mocks.validCar;
      const carCategory = { ...mocks.validCarCategory, carIds: [car.id] };
      const expected = car;

      const response = await supertest(app)
        .post("/available-cars")
        .send(carCategory)
        .expect(200);

      expect(response.body).to.not.be.empty;
      expect(response.body).to.be.deep.equal(expected);
    });
  });

  describe("/calculate-final-price:post", () => {
    it("given a carCategory, customer and numberOfDays it should calculate final amount in real", async () => {
      const carCategory = { ...mocks.validCarCategory, price: 37.6 };

      const customer = { ...mocks.validCustomer, age: 50 };

      const numberOfDays = 5;

      const body = {
        customer,
        carCategory,
        numberOfDays,
      };

      const expectedValue = new CarService({
        cars: carDatabase,
      }).calculateFinalPrice(customer, carCategory, numberOfDays);

      const response = await supertest(app)
        .post("/calculate-final-price")
        .send(body)
        .expect(200);

      expect(response.body).to.be.deep.equal(expectedValue);
    });
  });
});
