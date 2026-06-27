import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRoutes";

const App = () => (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
);

export default App;