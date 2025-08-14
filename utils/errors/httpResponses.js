const httpStatus = {
  Processing: {
    code: 102,
    message:
      "The server is processing the request, but no response is available yet.",
  },
  OK: { code: 200, message: "The request has succeeded." },
  Created: {
    code: 201,
    message: "created successfully ",
  },
  Forbidden: { code: 403, message: "Forbidden require to re-authenticating !" },
  unAuthorized: { code: 401, message: "unauthorized" },
  badRequest: { code: 400, message: "bad request" },
  NotFound: {
    code: 404,
    message: "not found",
    customMessage: "{key} not found",
  },
  conflict: {
    code: 409,
    message: "already exists",
    customMessage: "{key} already exists",
  },
  internalServerError: {
    code: 500,
    message: "Something went wrong. Try again later.",
  },
  sessionExpired: { code: 403, message: "session expired" },
  Accepted: {
    code: 202,
    message: "accepted",
  },
};

export default httpStatus;
