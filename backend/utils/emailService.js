import { Resend } from "resend";

const getApplicationUrl = () => {
  const value = process.env.APP_BASE_URL || process.env.CLIENT_ORIGIN;
  if (!value) throw new Error("APP_BASE_URL or CLIENT_ORIGIN must be configured for email links.");
  const url = new URL(value);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:")
    throw new Error("APP_BASE_URL must use HTTPS in production.");
  return url;
};

const emailLink = (path, token) => {
  const url = getApplicationUrl();
  url.pathname = path;
  url.search = new URLSearchParams({ token }).toString();
  return url.toString();
};

const sendEmail = async ({ to, subject, html }, resendClient) => {
  if (!resendClient && !process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured.");
  const resend = resendClient || new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Unify <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
  if (result.error) throw new Error("Email provider rejected the message.");
  return result.data;
};

const emailMarkup = ({ title, copy, url, action }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>${title}</h2>
    <p>${copy}</p>
    <p><a href="${url}">${action}</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  </div>`;

export const sendVerificationEmail = ({ email, token }, resendClient) =>
  sendEmail({
    to: email,
    subject: "Verify your Unify account",
    html: emailMarkup({
      title: "Welcome to Unify!",
      copy: "Verify your email address before signing in.",
      url: emailLink("/verify-email", token),
      action: "Verify my email",
    }),
  }, resendClient);

export const sendPasswordResetEmail = ({ email, token }, resendClient) =>
  sendEmail({
    to: email,
    subject: "Reset your Unify password",
    html: emailMarkup({
      title: "Reset your password",
      copy: "Use the link below to choose a new password. This link expires in one hour.",
      url: emailLink("/reset-password", token),
      action: "Reset my password",
    }),
  }, resendClient);
