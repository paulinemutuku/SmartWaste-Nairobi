import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FormContainer from "../components/Log in/FormContainer";
import { AuthContextProvider } from "../context/AuthContext";

jest.mock("../hooks/useLogin", () => ({
  useLogin: jest.fn(() => ({
    login: jest.fn(),
    error: null,
    isLoading: false,
  })),
}));

describe("FormContainer", () => {
  it("renders FormContainer correctly", () => {
    render(
      <AuthContextProvider>
        <FormContainer />
      </AuthContextProvider>
    );

    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
  });

  it("submits form correctly", async () => {
    const { login } = require("../hooks/useLogin");

    render(
      <AuthContextProvider>
        <FormContainer />
      </AuthContextProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith("test@example.com", "password123")
    );

  });
});
