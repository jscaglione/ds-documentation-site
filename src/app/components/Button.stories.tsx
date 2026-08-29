import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
    variant: "default",
    size: "md",
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: "Primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Destructive" },
};

export const Small: Story = {
  args: { size: "sm", children: "Small" },
};

export const Large: Story = {
  args: { size: "lg", children: "Large" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};

export const Loading: Story = {
  args: { loading: true, children: "Saving…" },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};
