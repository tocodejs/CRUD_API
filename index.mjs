import * as http from "http";

let users = [];
let idCounter = 1;
const server = http.createServer();

const getAllUsers = (response) => {
  response.writeHead(200, {
    "Content-Type": "application/json",
    "X-Powered-By": "bacon",
  });
  response.end(JSON.stringify(users));
};

const validateUser = (oUser) => {
  let oValidationResult = { isValid: true, message: "" };
  if (!oUser.username) {
    oValidationResult.isValid = false;
    oValidationResult.message = "Please provide username";
  } else if (!oUser.age || isNaN(oUser.age)) {
    oValidationResult.isValid = false;
    oValidationResult.message = "Please provide age. Age should be a number";
  } else if (!oUser.hobbies) {
    oValidationResult.isValid = false;
    oValidationResult.message = "Please provide hobbies as array";
  }
  return oValidationResult;
};

const addUser = (request, response) => {
  let body = [];
  request
    .on("data", (chunk) => {
      body.push(chunk);
    })
    .on("end", () => {
      body = Buffer.concat(body).toString();
      try {
        let user = JSON.parse(body);
        let oUserValidationResult = validateUser(user);
        if (oUserValidationResult.isValid) {
          user.id = idCounter;
          idCounter++;
          users.push(user);
          response.writeHead(201, {
            "Content-Type": "application/json",
            "X-Powered-By": "bacon",
          });
          response.end(JSON.stringify(user));
        } else {
          response.writeHead(400, {
            "Content-Type": "application/json",
            "X-Powered-By": "bacon",
          });

          response.end(
            JSON.stringify({ message: oUserValidationResult.message })
          );
        }
      } catch (e) {
        response.end(JSON.stringify({ message: "Invadid data structure" }));
      }
    });
};

const getUserById = (request, response) => {
  const aRequestParams = request.url.split("/");
  const RequestedUserId = aRequestParams[aRequestParams.length - 1];
  let resutUser = users.filter((oUser) => {
    return oUser.id == RequestedUserId;
  });
  if (isNaN(RequestedUserId)) {
    response.writeHead(400, {
      "Content-Type": "application/json",
      "X-Powered-By": "bacon",
    });
    response.end(
      JSON.stringify({
        message: `User id should be a number`,
      })
    );
  } else if (resutUser.length) {
    response.writeHead(200, {
      "Content-Type": "application/json",
      "X-Powered-By": "bacon",
    });
    response.end(JSON.stringify(resutUser));
  } else {
    response.writeHead(404, {
      "Content-Type": "application/json",
      "X-Powered-By": "bacon",
    });
    response.end(
      JSON.stringify({
        message: `User with id ${RequestedUserId} is not found`,
      })
    );
  }
};

server
  .on("request", (request, response) => {
    if (request.url === "/api/users") {
      if (request.method === "GET") {
        getAllUsers(response);
      } else if (request.method === "POST") {
        addUser(request, response);
      }
    } else if (request.url.indexOf("/api/users") === 0) {
      if (request.method === "GET") {
        getUserById(request, response);
      }
    }
  })
  .listen(4000);
