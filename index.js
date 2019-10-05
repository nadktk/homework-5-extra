const http = require('http');

class App {
  constructor() {
    this.mwList = [];
  }

  final(req, res) {
    res.statusCode = 404;
    res.end(`Cannot ${req.method} for URL: ${req.url}`);
  }

  use(middleware) {
    this.mwList.push(middleware);
  }

  handle(req, res) {
    this.request = req;
    this.response = res;

    const app = this;

    function applyMiddleware(i) {
      let next = app.mwList[i + 1]
        ? applyMiddleware(i + 1)
        : () => app.final(app.request, app.response);
      return () => {
        app.mwList[i](app.request, app.response, next);
      };
    }

    app.mwList.length
      ? applyMiddleware(0)()
      : app.final(app.request, app.response);
  }
}

const app = new App();

const server = http.createServer((req, res) => app.handle(req, res));

app.use((req, res, next) => {
  console.log('middleware 1 start');
  req.test = 'hello from middleware 1';
  next();
  console.log('middleware 1 end');
});

app.use((req, res, next) => {
  console.log('middleware 2');
  console.log(req.test);
  next();
});

app.use((req, res, next) => {
  console.log('middleware 3');
  res.end('Hello');
});

server.listen(3000);

// Output in the console should be
// middleware 1 start
// middleware 2
// hello from middleware 1
// middleware 3
// middleware 1 end
