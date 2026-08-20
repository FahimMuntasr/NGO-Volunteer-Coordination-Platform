import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import RegisteredEvents from "./pages/RegisteredEvents";
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;