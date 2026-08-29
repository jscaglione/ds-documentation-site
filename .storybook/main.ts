import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    config.server = {
      ...config.server,
      cors: true,
      headers: {
        ...config.server?.headers,
        // Docs site embeds iframe.html from another localhost port.
        "Content-Security-Policy": "frame-ancestors *",
      },
    };
    return config;
  },
};

export default config;
