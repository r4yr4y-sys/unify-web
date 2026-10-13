import assert from "node:assert/strict";
import test from "node:test";
import { sendPasswordResetEmail, sendVerificationEmail } from "./emailService.js";

test("verification emails use the configured application URL and provider client", async () => {
  const previousUrl = process.env.APP_BASE_URL;
  process.env.APP_BASE_URL = "http://localhost:5173";
  let sent;
  await sendVerificationEmail(
    { email: "student@example.test", token: "a".repeat(64) },
    { emails: { send: async (message) => { sent = message; return { data: { id: "mock-id" } }; } } },
  );
  assert.equal(sent.to, "student@example.test");
  assert.match(sent.html, /http:\/\/localhost:5173\/verify-email\?token=/);
  if (previousUrl === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = previousUrl;
});

test("verification email delivery rejects when the provider rejects it", async () => {
  const previousUrl = process.env.APP_BASE_URL;
  process.env.APP_BASE_URL = "http://localhost:5173";
  await assert.rejects(
    sendVerificationEmail(
      { email: "student@example.test", token: "a".repeat(64) },
      { emails: { send: async () => ({ error: { message: "rejected" } }) } },
    ),
    /provider rejected/,
  );
  if (previousUrl === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = previousUrl;
});

test("password-reset emails use the configured reset URL", async () => {
  const previousUrl = process.env.APP_BASE_URL;
  process.env.APP_BASE_URL = "http://localhost:5173";
  let sent;
  await sendPasswordResetEmail(
    { email: "student@example.test", token: "b".repeat(64) },
    { emails: { send: async (message) => { sent = message; return { data: { id: "mock-id" } }; } } },
  );
  assert.equal(sent.subject, "Reset your Unify password");
  assert.match(sent.html, /http:\/\/localhost:5173\/reset-password\?token=/);
  if (previousUrl === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = previousUrl;
});
