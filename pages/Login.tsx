import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BlurReveal } from '../components/BlurReveal';
import { Button } from '../components/ui/Button';

const Login: React.FC = () => {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [configInput, setConfigInput] = useState('');

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async () => {
    setError(null);
    try {
      await signIn();
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || 
          err.message?.includes('api-key-not-valid') ||
          err.code === 'auth/internal-error') {
        setError("Invalid Firebase Configuration. Please provide your config object below.");
        setShowConfig(true);
      } else {
        setError(err.message || "Failed to sign in");
      }
    }
  };

  const saveConfig = () => {
    try {
      const parsed = JSON.parse(configInput);
      localStorage.setItem('firebase_config', JSON.stringify(parsed));
      window.location.reload();
    } catch (e) {
      setError("Invalid JSON format.");
    }
  };

  if (showConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <BlurReveal className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">System Configuration</h1>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
          <div className="border border-zinc-200 p-6 rounded-xl shadow-sm space-y-4 bg-white">
            <p className="text-xs text-zinc-500">
              Paste your JSON config. For images, add <code>cloudinaryCloudName</code> and <code>cloudinaryUploadPreset</code>.
            </p>
            <textarea 
              className="w-full h-48 p-3 text-xs font-mono border border-zinc-200 rounded-md bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder='{ "apiKey": "...", "cloudinaryCloudName": "..." }'
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={() => setShowConfig(false)} variant="outline" className="w-full">Cancel</Button>
              <Button onClick={saveConfig} className="w-full">Save & Reload</Button>
            </div>
          </div>
        </BlurReveal>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BlurReveal className="w-full max-w-sm text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter">Quiz_OS</h1>
          <p className="text-zinc-500 text-sm tracking-wide">ENTER THE SYSTEM</p>
        </div>
        
        <div className="border border-zinc-200 p-8 rounded-xl shadow-sm space-y-6 bg-white">
          <div className="h-12 w-12 bg-zinc-100 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          
          {error && (
             <div className="p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
               {error}
             </div>
          )}

          <Button onClick={handleSignIn} className="w-full" size="lg">
            Continue with Google
          </Button>
          <div className="text-xs text-zinc-400">
            <button onClick={() => setShowConfig(true)} className="underline hover:text-zinc-600">
              Configure Connection
            </button>
          </div>
        </div>
      </BlurReveal>
    </div>
  );
};

export default Login;