import nodemailer from "nodemailer";

const getApplicationUrl = () => {
  const value = process.env.APP_BASE_URL || process.env.CLIENT_ORIGIN;
  if (!value)
    throw new Error(
      "APP_BASE_URL or CLIENT_ORIGIN must be configured for email links.",
    );
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

const emailFailureDetails = (error) => {
  const code = error?.code;
  if (code === "EMAIL_CONFIGURATION") return { category: "configuration", code };
  if (code === "EAUTH") return { category: "authentication", code, smtpStatus: error.responseCode };
  if (["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EDNS", "ESOCKET"].includes(code)) {
    return { category: "connection", code };
  }
  if (code === "EENVELOPE") return { category: "recipient-or-envelope", code, smtpStatus: error.responseCode };
  return { category: "smtp-delivery", code: code || "UNKNOWN", smtpStatus: error?.responseCode };
};

const logEmailFailure = (error) => {
  // Do not log recipients, credentials, links, or tokens.
  console.error("Email delivery failed.", emailFailureDetails(error));
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_APP_PASSWORD?.trim();

    if (!user || !pass) {
      const error = new Error("Gmail SMTP credentials are not configured.");
      error.code = "EMAIL_CONFIGURATION";
      throw error;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    return await transporter.sendMail({
      from: `Unify <${user}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    logEmailFailure(error);
    throw error;
  }
};

const emailMarkup = ({ title, copy, url, action }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>${title}</h2>
    <p>${copy}</p>
    <p><a href="${url}">${action}</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  </div>`;

export const sendVerificationEmail = ({ email, token }) =>
  sendEmail({
    to: email,
    subject: "Verify your Unify account",
    html: emailMarkup({
      title: "Welcome to Unify!",
      copy: "Verify your email address before signing in.",
      url: emailLink("/verify-email", token),
      action: "Verify my email",
    }),
  });

export const sendPasswordResetEmail = ({ email, token }) =>
  sendEmail({
    to: email,
    subject: "Reset your Unify password",
    html: emailMarkup({
      title: "Reset your password",
      copy: "Use the link below to choose a new password. This link expires in one hour.",
      url: emailLink("/reset-password", token),
      action: "Reset my password",
    }),
  });
