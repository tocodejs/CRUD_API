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
        response.writeHead(500, {
          "Content-Type": "application/json",
          "X-Powered-By": "bacon",
        });
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

const updateUser = (request, response) => {
  let body = [];
  const aRequestParams = request.url.split("/");
  const RequestedUserId = aRequestParams[aRequestParams.length - 1];
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
  } else {
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
            let bIsUpdated = false;

            users.forEach((oUser) => {
              if (oUser.id == RequestedUserId) {
                oUser.name = user.name;
                oUser.age = user.age;
                oUser.hobbies = user.hobbies;
                bIsUpdated = true;
              }
            });
            if (bIsUpdated) {
              response.writeHead(200, {
                "Content-Type": "application/json",
                "X-Powered-By": "bacon",
              });
              response.end(JSON.stringify(user));
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
          response.writeHead(500, {
            "Content-Type": "application/json",
            "X-Powered-By": "bacon",
          });
          response.end(JSON.stringify({ message: "Invadid data structure" }));
        }
      });
  }
};

const deleteUser = (request, response) => {
  const aRequestParams = request.url.split("/");
  const RequestedUserId = aRequestParams[aRequestParams.length - 1];
  let userIndexToDelete;
  users.forEach((oUser, index) => {
    if (oUser.id == RequestedUserId) {
      userIndexToDelete = index;
    }
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
  } else if (userIndexToDelete !== undefined) {
    users.splice(userIndexToDelete, 1);
    response.writeHead(204, {
      "Content-Type": "application/json",
      "X-Powered-By": "bacon",
    });
    response.end();
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

const noService = (request, response) => {
  response.writeHead(404, {
    "Content-Type": "application/json",
    "X-Powered-By": "bacon",
  });
  response.end(
    JSON.stringify({
      message: `No service to handle the request`,
    })
  );
};

server
  .on("request", (request, response) => {
    if (request.url === "/api/users") {
      if (request.method === "GET") {
        getAllUsers(response);
      } else if (request.method === "POST") {
        addUser(request, response);
      } else {
        noService(request, response);
      }
    } else if (request.url.indexOf("/api/users") === 0) {
      if (request.method === "GET") {
        getUserById(request, response);
      } else if (request.method === "DELETE") {
        deleteUser(request, response);
      } else if (request.method === "PUT") {
        updateUser(request, response);
      } else {
        noService(request, response);
      }
    } else {
      noService(request, response);
    }
  })
  .listen(4000);
