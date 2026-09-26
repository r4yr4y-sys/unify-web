import { co2 } from '@tgwf/co2';

const co2Emission = new co2({ model: 'swd' });
const GREEN_HOST = process.env.GREEN_HOST === 'true';

function byteLength(value, encoding = 'utf8') {
  if (value == null) return 0;
  if (typeof value === 'string') return Buffer.byteLength(value, encoding);
  if (Buffer.isBuffer(value)) return value.byteLength;
  if (ArrayBuffer.isView(value)) return value.byteLength;
  if (value instanceof ArrayBuffer) return value.byteLength;
  return 0;
}

function getRequestBytes(request) {
  const headers = Object.entries(request.headers)
    .map(([name, value]) => `${name}: ${Array.isArray(value) ? value.join(', ') : value}\r\n`)
    .join('');
  const requestLine = `${request.method} ${request.originalUrl} HTTP/1.1\r\n`;
  const headerBytes = Buffer.byteLength(`${requestLine}${headers}\r\n`, 'utf8');
  const contentLength = Number(request.headers['content-length']);
  const bodyBytes = Number.isFinite(contentLength) && contentLength >= 0
    ? contentLength
    : byteLength(JSON.stringify(request.body ?? {}));

  return headerBytes + bodyBytes;
}

export default function carbonFootprint(request, response, next) {
  let responseBytes = 0;
  let totalBytes = getRequestBytes(request);
  const originalWrite = response.write;
  const originalEnd = response.end;

  response.write = function write(chunk, ...args) {
    responseBytes += byteLength(chunk, typeof args[0] === 'string' ? args[0] : 'utf8');
    return originalWrite.call(this, chunk, ...args);
  };

  response.end = function end(chunk, ...args) {
    responseBytes += byteLength(chunk, typeof args[0] === 'string' ? args[0] : 'utf8');
    totalBytes = getRequestBytes(request) + responseBytes;

    if (!this.headersSent) {
      this.setHeader('X-Data-Transferred-Bytes', String(totalBytes));
      this.setHeader(
        'X-Estimated-CO2-Grams',
        co2Emission.perByte(totalBytes, GREEN_HOST).toFixed(3),
      );
    }

    return originalEnd.call(this, chunk, ...args);
  };

  next();
}
