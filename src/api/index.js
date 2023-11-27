const http = require('http');
const { once } = require('events');

const routes = {
  '/available-cars:get': (request, response) => {
    response.write('available cars page');
    return response.end();
  },
  '/rent-a-car:post': async (request, response) => {
    const car = JSON.parse(await once(request, 'data'));
    console.log(car);
    return response.end('ok');
  },
  default: (request, response) => {
    response.writeHead(404);
    response.write('Not found!');
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
  .listen(3000, () => console.log('Listening at port 3000'));
