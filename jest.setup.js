const { cancelAnimationFrame, requestAnimationFrame } = require("request-animation-frame-polyfill");
const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.window = {
	requestAnimationFrame,
	cancelAnimationFrame,
};

delete process.env.CORS_PROXY_SERVICE_URL;

jest.setTimeout(15000);
