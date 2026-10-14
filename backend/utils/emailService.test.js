import assert from "node:assert/strict";
import test from "node:test";
import nodemailer from "nodemailer";
import { sendPasswordResetEmail, sendVerificationEmail } from "./emailService.js";

const withEmailEnvironment = async (callback) => {
  const previousUrl = process.env.APP_BASE_URL;
  const previousUser = process.env.EMAIL_USER;
  const previousPassword = process.env.EMAIL_APP_PASSWORD;
  process.env.APP_BASE_URL = "http://localhost:5173";
  process.env.EMAIL_USER = "unify.web.team@gmail.com";
  process.env.EMAIL_APP_PASSWORD = "test-app-password";
  try {
    await callback();
  } finally {
    if (previousUrl === undefined) delete process.env.APP_BASE_URL;
    else process.env.APP_BASE_URL = previousUrl;
    if (previousUser === undefined) delete process.env.EMAIL_USER;
    else process.env.EMAIL_USER = previousUser;
    if (previousPassword === undefined) delete process.env.EMAIL_APP_PASSWORD;
    else process.env.EMAIL_APP_PASSWORD = previousPassword;
  }
};

const withTransportStub = async (callback) => {
  const originalCreateTransport = nodemailer.createTransport;
  let sent;
  nodemailer.createTransport = () => ({
    sendMail: async (message) => {
      sent = message;
      return { messageId: "mock-id" };
    },
  });
  try {
    await callback(() => sent);
  } finally {
    nodemailer.createTransport = originalCreateTransport;
  }
};

test("verification emails use the configured application URL and Nodemailer", async () => {
  await withEmailEnvironment(() => withTransportStub(async (getSent) => {
    await sendVerificationEmail({ email: "student@example.test", token: "a".repeat(64) });
    const sent = getSent();
    assert.equal(sent.to, "student@example.test");
    assert.match(sent.html, /http:\/\/localhost:5173\/verify-email\?token=/);
  }));
});

test("verification email delivery propagates a Nodemailer failure", async () => {
  await withEmailEnvironment(async () => {
    const originalCreateTransport = nodemailer.createTransport;
    nodemailer.createTransport = () => ({
      sendMail: async () => {
        const error = new Error("rejected");
        error.code = "EAUTH";
        throw error;
      },
    });
    try {
      await assert.rejects(sendVerificationEmail({ email: "student@example.test", token: "a".repeat(64) }), /rejected/);
    } finally {
      nodemailer.createTransport = originalCreateTransport;
    }
  });
});

test("password-reset emails use the configured reset URL", async () => {
  await withEmailEnvironment(() => withTransportStub(async (getSent) => {
    await sendPasswordResetEmail({ email: "student@example.test", token: "b".repeat(64) });
    const sent = getSent();
    assert.equal(sent.subject, "Reset your Unify password");
    assert.match(sent.html, /http:\/\/localhost:5173\/reset-password\?token=/);
  }));
});
