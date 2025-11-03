import TestComponent from ".";
import { render, screen } from "@/test/test-utils";

describe("TestComponent", () => {
  it("affiche un lien Login", () => {
    render(<TestComponent />);
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });
});
