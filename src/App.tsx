import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './config';
import { Landing } from './pages/Landing';
import { EmbeddedApp } from './pages/EmbeddedApp';
import { Dashboard } from './pages/Dashboard';
import { OperationsAccessGate } from './pages/OperationsAccessGate';
import { StudioReference } from './pages/StudioReference';
import { SupportCenter } from './pages/SupportCenter';
import { applySurfaceMode, SURFACE_MODE_POLICY } from './surfaceMode';
import { SurfaceCard } from './components/ui/SurfaceCard';
import { isRouteProtected } from './config/informationArchitecture';
import { ROUTES } from './config/routes';
import { UI_PRESETS } from './config/uiPresets';
import { BENCHMARK_EVENTS } from './config/benchmarkEvents';
import { trackBenchmarkEvent } from './lib/benchmarkTracker';
import { useBenchmarkSync } from './hooks/useBenchmarkSync';

interface User {
  id: string;
  username: string;
  avatar?: string;
}

const RouteBenchmarkTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackBenchmarkEvent(BENCHMARK_EVENTS.routeView, {
      route: location.pathname,
    });
  }, [location.pathname]);

  return null;
};

export default function App() {
  useBenchmarkSync();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bootProgress, setBootProgress] = useState(8);

  const checkAuth = useCallback(async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  useEffect(() => {
    applySurfaceMode(SURFACE_MODE_POLICY);
    trackBenchmarkEvent(BENCHMARK_EVENTS.appBootStart);
  }, []);

  useEffect(() => {
    checkAuth();
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkAuth();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading) {
      setBootProgress(100);
      trackBenchmarkEvent(BENCHMARK_EVENTS.appBootComplete, {
        authenticated: Boolean(user),
      });
      return;
    }

    setBootProgress(8);
    const interval = window.setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 92) return prev;
        const increment = prev < 36 ? 9 : prev < 68 ? 5 : 2.2;
        return Math.min(92, prev + increment + Math.random() * 1.4);
      });
    }, 110);

    return () => window.clearInterval(interval);
  }, [authLoading, user]);

  useEffect(() => {
    const handleDelegatedClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const element = target.closest<HTMLElement>('[data-benchmark-event]');
      if (!element) {
        return;
      }

      const eventName = element.dataset.benchmarkEvent;
      if (!eventName) {
        return;
      }

      trackBenchmarkEvent(eventName, {
        id: element.dataset.benchmarkId,
        label: element.dataset.benchmarkLabel,
        area: element.dataset.benchmarkArea,
      });
    };

    document.addEventListener('click', handleDelegatedClick, { capture: true });
    return () => document.removeEventListener('click', handleDelegatedClick, { capture: true });
  }, []);

  useEffect(() => {
    const revealClass = 'io-reveal';
    const visibleClass = 'is-visible';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(visibleClass);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    const observeTargets = () => {
      const targets = document.querySelectorAll<HTMLElement>(`.${revealClass}:not(.${visibleClass})`);
      targets.forEach((target) => observer.observe(target));
    };

    observeTargets();

    const mutationObserver = new MutationObserver(() => {
      observeTargets();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    let lastTime = performance.now();

    const applyRevealDurationByScrollSpeed = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const deltaY = Math.abs(currentY - lastY);
      const deltaT = Math.max(16, now - lastTime);
      const speed = deltaY / deltaT;
      const normalized = Math.min(1, speed / 2);
      const duration = 0.7 - normalized * 0.3;

      document.documentElement.style.setProperty('--reveal-duration', `${duration.toFixed(3)}s`);

      lastY = currentY;
      lastTime = now;
    };

    applyRevealDurationByScrollSpeed();
    window.addEventListener('scroll', applyRevealDurationByScrollSpeed, { passive: true });

    return () => {
      window.removeEventListener('scroll', applyRevealDurationByScrollSpeed);
    };
  }, []);

  const bootStep =
    bootProgress < 30
      ? 'SECURE HANDSHAKE'
      : bootProgress < 55
      ? 'AUTH CONTEXT SYNC'
      : bootProgress < 80
      ? 'PIPELINE VALIDATION'
      : 'DASHBOARD BOOTSTRAP';

  if (authLoading) {
    return (
      <div className="surface-page surface-bridge hud-grid flex min-h-screen items-center justify-center px-6">
        <SurfaceCard className={`quant-scan w-full max-w-xl ${UI_PRESETS.borderBase} bg-zinc-900/45 p-8`}>
          <div className={`mono-data text-xs tracking-[0.2em] ${UI_PRESETS.accentText}`}>DISCORD WEBVIEW BOOT</div>
          <h1 className="mt-3 text-2xl font-semibold md:text-3xl">System Initializing...</h1>
          <p className="mt-3 text-sm text-current">보안 컨텍스트와 운영 데이터를 동기화 중입니다.</p>

          <div className={`mt-7 ${UI_PRESETS.borderBase} bg-zinc-950/70 p-2`}>
            <div className="h-2 w-full overflow-hidden bg-zinc-200">
              <div
                className={`h-full ${UI_PRESETS.accentBg} transition-[width] duration-150 ease-out`}
                style={{ width: `${bootProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="mono-data text-current">{bootStep}</span>
            <span className={`mono-data ${UI_PRESETS.accentText}`}>{Math.floor(bootProgress)}%</span>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <RouteBenchmarkTracker />
      <Routes>
        <Route path={ROUTES.home} element={<Landing />} />
        <Route path={ROUTES.inApp} element={<EmbeddedApp />} />
        <Route path={ROUTES.embedded} element={<Navigate to={ROUTES.inApp} replace />} />
        <Route path={ROUTES.landingSecond} element={<Navigate to={ROUTES.inApp} replace />} />
        <Route 
          path={ROUTES.dashboard}
          element={
            user || !isRouteProtected(ROUTES.dashboard) ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <OperationsAccessGate />
            )
          } 
        />
        <Route path={ROUTES.studio} element={<StudioReference />} />
        <Route path={ROUTES.support} element={<SupportCenter />} />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}



