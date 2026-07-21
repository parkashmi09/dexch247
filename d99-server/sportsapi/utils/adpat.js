
export default function adaptExpress(ctrl) {
  return async ({ query = {}, params = {}, body = {}, extra = {} }) => {
    return new Promise((resolve, reject) => {
      let statusCode = 200;

      const res = {
        status: code => { statusCode = code; return res; },
        json:   payload => resolve({ statusCode, data: payload }),
        send:   payload => resolve({ statusCode, data: payload }),
      };

      const req = { query, params, body, ...extra };
      ctrl(req, res, reject);
    });
  };
}
