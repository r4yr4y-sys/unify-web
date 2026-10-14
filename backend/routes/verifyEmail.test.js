import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import test from "node:test";
import User from "../models/userSchema.js";
import { hashToken } from "../utils/authTokens.js";
import router from "./verifyEmail.js";

const routeHandler = (path) =>
  router.stack.find((layer) => layer.route?.path === path).route.stack[0].handle;

const makeResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

const next = (error) => { if (error) throw error; };

test("forgot-password accepts nonexistent accounts without creating a token", async () => {
  const originalFindOne = User.findOne;
  User.findOne = () => ({ select: async () => null });
  try {
    const response = makeResponse();
    await routeHandler("/forgot-password")({ body: { email: "missing@example.test" } }, response, next);
    assert.equal(response.statusCode, 202);
    assert.match(response.body.message, /If an account exists/);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("forgot-password creates a hashed, expiring token for an unverified account and logs delivery failures", async () => {
  const originalFindOne = User.findOne;
  const originalError = console.error;
  const errors = [];
  let saved = false;
  const user = {
    email: "student@example.test",
    emailVerified: false,
    passwordResetSentAt: undefined,
    save: async () => { saved = true; },
  };
  User.findOne = () => ({ select: async () => user });
  console.error = (...args) => errors.push(args);
  try {
    const before = Date.now();
    const response = makeResponse();
    await routeHandler("/forgot-password")({ body: { email: user.email } }, response, next);
    assert.equal(response.statusCode, 202);
    assert.equal(saved, true);
    assert.match(user.passwordResetToken, /^[a-f0-9]{64}$/);
    assert.ok(user.passwordResetExpires.getTime() > before);
    assert.ok(user.passwordResetExpires.getTime() <= before + 60 * 60 * 1000 + 1000);
    assert.equal(errors.length, 1);
    assert.equal(errors[0][0], "Password-reset email delivery failed; see the categorized email delivery log.");
  } finally {
    User.findOne = originalFindOne;
    console.error = originalError;
  }
});

test("reset-password hashes the new password and invalidates the token", async () => {
  const originalFindOne = User.findOne;
  const rawToken = "a".repeat(64);
  let receivedQuery;
  let saved = false;
  const user = {
    passwordHash: await bcrypt.hash("old-password", 12),
    passwordResetToken: hashToken(rawToken),
    passwordResetExpires: new Date(Date.now() + 60_000),
    passwordResetSentAt: new Date(),
    save: async () => { saved = true; },
  };
  User.findOne = (query) => {
    receivedQuery = query;
    return { select: async () => user };
  };
  try {
    const response = makeResponse();
    await routeHandler("/reset-password")({ body: { token: rawToken, password: "new-password" } }, response, next);
    assert.equal(response.statusCode, 200);
    assert.equal(receivedQuery.passwordResetToken, hashToken(rawToken));
    assert.equal(saved, true);
    assert.equal(await bcrypt.compare("new-password", user.passwordHash), true);
    assert.equal(user.passwordResetToken, undefined);
    assert.equal(user.passwordResetExpires, undefined);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("reset-password rejects invalid, expired, and reused tokens", async () => {
  const originalFindOne = User.findOne;
  User.findOne = () => ({ select: async () => null });
  try {
    for (const token of ["not-a-token", "b".repeat(64)]) {
      const response = makeResponse();
      await routeHandler("/reset-password")({ body: { token, password: "new-password" } }, response, next);
      assert.equal(response.statusCode, 400);
    }
  } finally {
    User.findOne = originalFindOne;
  }
});
