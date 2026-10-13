import assert from "node:assert/strict";
import test from "node:test";
import { generateToken, hashToken } from "./authTokens.js";

test("generated auth tokens are random 32-byte hex values", () => {
  const first = generateToken();
  const second = generateToken();
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.notEqual(first, second);
});

test("token hashes are deterministic and do not contain the raw token", () => {
  const token = generateToken();
  assert.equal(hashToken(token), hashToken(token));
  assert.notEqual(hashToken(token), token);
  assert.match(hashToken(token), /^[a-f0-9]{64}$/);
});
