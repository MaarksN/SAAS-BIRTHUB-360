const sharedConfig = require("../../libs/ui/tailwind.config.js");

module.exports = {
  ...sharedConfig,
  content: [
    ...sharedConfig.content,
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
