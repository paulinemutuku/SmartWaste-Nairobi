import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();
  
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("user");
    
    // Clear context
    dispatch({ type: "LOGOUT" });
    
    // Redirect to login page
    navigate("/login");
    
    // Optional: Clear any other stored data
    // localStorage.removeItem("token");
    // localStorage.removeItem("userPreferences");
  };
  
  return { logout };
};