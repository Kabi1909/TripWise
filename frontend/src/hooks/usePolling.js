import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
export default function usePolling(path, initial = null, interval = 30000) {
  const initialRef = useRef(initial);
  const [state, setState] = useState({ path, data: initial, error: '', loading: true, updatedAt: null });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    let timer;
    const load = async () => {
      try {
        const data = await api(path);
        if (active) setState({ path, data, error: '', loading: false, updatedAt: new Date() });
      } catch (error) {
        if (active) setState(previous => ({ ...(previous.path === path ? previous : { path, data: initialRef.current, updatedAt: null }), error: error.message, loading: false }));
      }
      if (active) timer = setTimeout(load, interval);
    };
    load();
    return () => { active = false; clearTimeout(timer); };
  }, [path, interval, version]);
  return { ...(state.path === path ? state : { data: initial, error: '', loading: true, updatedAt: null }), refresh: () => setVersion(v => v + 1) };
}
