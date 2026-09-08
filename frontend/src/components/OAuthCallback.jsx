import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
const exchanges = new Map();
export default function OAuthCallback() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const code = params.get('code');
    const verifier = sessionStorage.getItem('tripwise_oauth_verifier');
    let active = true;
    if (!exchanges.has(code)) exchanges.set(code, (async () => {
      if (params.get('error')) throw new Error(params.get('error'));
      if (!code || !verifier) throw new Error('Please restart sign-in in this browser tab.');
      return api('/auth/oauth/exchange', { method: 'POST', body: { code, verifier } });
    })());
    exchanges.get(code).then(data => {
      if (!active) return;
      sessionStorage.removeItem('tripwise_oauth_verifier');
      login(data);
      navigate(data.role === 'Travel Agent' ? '/agent' : '/trips', { replace: true });
    }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [login, navigate]);
  return <main className="min-h-screen p-8 bg-[#f9f9fe]"><p role="status">{error || 'Completing sign-in…'}</p>{error && <button onClick={() => navigate('/login')} className="text-[#0058bc] mt-4">Return to login</button>}</main>;
}
