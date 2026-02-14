import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import api from '../services/api.js';
import { Container, Box, TextField, Button, Typography } from "@mui/material";
import { logger } from '../utils/log.js';
import { useAuth } from "../context/AuthContext.jsx";
// import { setAuthToken } from "../services/api.js";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const from = loc.state?.from?.pathname || '/';
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ busy, setBysy ] = useState(false);
    const [ err, setErr ] = useState('');

    const onSubmit = async (e) => {
        e?.preventDefault();
        setBysy(true);
        setErr('');
        try {
            const res = await login( email, password );
            if ( res?.accessToken ) {
                nav(from, { replace: true });
            } else {
                setErr("Invalid Credentials");
            }
        } catch (error) {
            logger.error(error.message);
            setErr("Login failes"); 
        } finally {
            setBysy(false);
        }
    };

    const fillDemoCredentials = () => {
        setEmail("demo@srm.com");
        setPassword("demo123");
    }

    return (
        <Container maxWidth='xs' >
            <Box mt={12} p={4} boxShadow={3} borderRadius={2} >
                <Typography variant="h5" mb={2} >
                   Welcome, Please Sign in
                </Typography>
                <form onSubmit={onSubmit} >
                    {import.meta.env.VITE_IS_DEMO === 'true' && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" >
                            <button
                                type="button"
                                onClick={fillDemoCredentials}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm transition-colors"
                            >
                                Auto-Fill Demo Account
                            </button>
                        </div>
                    )}
                    <TextField label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
                    <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
                    {err && (
                        <Typography color="error" variant='body2' sx={{ mb: 1 }} >
                            { err }
                        </Typography>
                    )}
                    <Button disabled={busy} type='submit' variant='contained' fullWidth >
                        { busy ? "Signing in..." : "Sign in" }
                    </Button>
                </form>
            </Box>
        </Container>
    );
}