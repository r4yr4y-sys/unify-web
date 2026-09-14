const ultraRareGreeting = "Konnichiwa, {firstName}-san! こんにちは！";

const veryRareGreetings = [
  "Thank God, you're back, {firstName}.",
  "Welcome back, {firstName}, the grind continues.",
  "A wild {firstName} has entered the building.",
  "Well, well, well, {firstName}, we meet again.",
  "Look who decided to show up. It's you, {firstName}.",
];

const rareGreetings = [
  "Good to see you, {firstName}!",
  "Ready to cook, {firstName}?",
  "Alright, {firstName}, let's get things done.",
  "Back at it, {firstName}?",
];

export const getFirstName = (name) =>
  String(name || "").trim().split(/\s+/)[0] || "there";

const normalGreeting = (firstName, hour) => {
  if (hour >= 5 && hour < 12) return `Good morning, ${firstName}!`;
  if (hour >= 12 && hour < 18) return `Good afternoon, ${firstName}!`;
  if (hour >= 18 && hour < 22) return `Good evening, ${firstName}!`;
  return `Late-night study session, ${firstName}?`;
};

export const createDashboardGreeting = (
  fullName,
  now = new Date(),
  random = Math.random(),
) => {
  const firstName = getFirstName(fullName);
  let template;

  // 1% ultra-rare, 12.5% very-rare, 20% rare, and normal greetings otherwise.
  if (random < 0.01) template = ultraRareGreeting;
  else if (random < 0.135)
    template = veryRareGreetings[Math.floor((random - 0.01) / 0.025)];
  else if (random < 0.335)
    template = rareGreetings[Math.floor((random - 0.135) / 0.05)];
  else return normalGreeting(firstName, now.getHours());

  return template.replace("{firstName}", firstName);
};
