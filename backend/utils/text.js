const text = (value) => (typeof value === 'string' ? value.trim() : '');
const badRequest = (message) =>
  Object.assign(new Error(message), { status: 400 });

export { text, badRequest };

