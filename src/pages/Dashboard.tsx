import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, Bell, ChevronLeft, ChevronRight, ExternalLink, Link as LinkIcon, LogOut, Play, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '../config';
import { createStaggerPreset } from '../config/motionPresets';
import { validateYouTubeUrl } from '../utils';
import { createDashboardBotInviteUrl } from '../config/discord';
import { GlitchLineQuantCard, PremiumInsightPaywallCard, RadarQuantCard, RollingValue } from '../components/QuantVisuals';
import { TopSectionSwitcher } from '../components/TopSectionSwitcher';
import { BackToTopButton } from '../components/BackToTopButton';
import { commonText } from '../content/commonText';
import { dashboardText } from '../content/dashboardText';
import { dashboardContent } from '../content/dashboardContent';
import { UI_PRESETS } from '../config/uiPresets';
import { SECTION_MOTION_TOKENS } from '../config/experienceTokens';
import { BENCHMARK_EVENTS } from '../config/benchmarkEvents';
import { BOT_INVITE_URL } from '../config/sectionNavigation';
import { trackBenchmarkEvent } from '../lib/benchmarkTracker';
import { AppHeader } from '../components/ui/AppHeader';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { UiButton } from '../components/ui/UiButton';
import { FormInput, FormSelect } from '../components/ui/FormControls';
import { StatusPill } from '../components/ui/StatusPill';

interface DashboardProps {
  user: { id: string; username: string; avatar?: string | null } | null;
  onLogout?: () => void;
}

interface StatusData {
  online: boolean;
  botName: string | null;
  guildsCount: number;
  clientId?: string;
}

interface SourceItem {
  id: number;
  name: string;
  url: string;
  guild_name?: string;
  channel_name?: string;
  last_check_status?: string;
  last_check_at?: string;
  last_check_error?: string;
}

interface LogItem {
  id: number;
  type: 'error' | 'success' | 'info' | string;
  message: string;
  created_at?: string;
}

interface GuildItem {
  id: string;
  name: string;
  botInGuild?: boolean;
}

interface ChannelItem {
  id: string;
  name: string;
  type: number;
  parentId?: string;
  position: number;
}

interface BenchmarkSummaryData {
  totalEvents: number;
  topEvents: Array<{ name: string; count: number }>;
  topRoutes: Array<{ path: string; count: number }>;
  lastEventAt: string | null;
  source: string;
}

interface BenchmarkReportData {
  windowDays: number;
  totals: {
    events: number;
    sessions: number;
  };
  funnel: {
    homeSessions: number;
    inAppSessions: number;
    dashboardSessions: number;
    homeToInAppRate: number;
    inAppToDashboardRate: number;
    homeDropoffRate: number;
    inAppDropoffRate: number;
  };
  nodeStats: Array<{ path: string; eventsCount: number }>;
  ctaStats: Array<{ label: string; count: number }>;
  updatedAt: string | null;
  source: string;
}

const dashboardStagger = createStaggerPreset({
  staggerChildren: SECTION_MOTION_TOKENS.dashboard.staggerChildren,
  delayChildren: SECTION_MOTION_TOKENS.dashboard.delayChildren,
  itemDuration: SECTION_MOTION_TOKENS.dashboard.itemDuration,
});
const staggerContainer = dashboardStagger.container;
const staggerItem = dashboardStagger.item;

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sources'>('overview');
  const [status, setStatus] = useState<StatusData>({ online: false, botName: null, guildsCount: 0 });
  const [sourcePageData, setSourcePageData] = useState<{ sources: SourceItem[]; total: number; page: number; limit: number }>({
    sources: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [logPageData, setLogPageData] = useState<{ logs: LogItem[]; total: number }>({ logs: [], total: 0 });
  const [guilds, setGuilds] = useState<GuildItem[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [benchmarkSummary, setBenchmarkSummary] = useState<BenchmarkSummaryData>({
    totalEvents: 0,
    topEvents: [],
    topRoutes: [],
    lastEventAt: null,
    source: 'memory',
  });
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkReportData>({
    windowDays: 7,
    totals: { events: 0, sessions: 0 },
    funnel: {
      homeSessions: 0,
      inAppSessions: 0,
      dashboardSessions: 0,
      homeToInAppRate: 0,
      inAppToDashboardRate: 0,
      homeDropoffRate: 0,
      inAppDropoffRate: 0,
    },
    nodeStats: [],
    ctaStats: [],
    updatedAt: null,
    source: 'memory',
  });

  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedGuildId, setSelectedGuildId] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [loadingGuilds, setLoadingGuilds] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [clientId, setClientId] = useState('');
  const [addSourceStatus, setAddSourceStatus] = useState('');

  const [testUrl, setTestUrl] = useState(dashboardText.defaults.testUrl);
  const [testResult, setTestResult] = useState('');
  const [statHoverTick, setStatHoverTick] = useState({ status: 0, guilds: 0, sources: 0 });
  const dashboardInviteUrl = clientId ? createDashboardBotInviteUrl(clientId) : BOT_INVITE_URL;

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/api/status');
      if (res.status === 401) return;
      const data = await res.json();
      if (!data?.error) {
        setStatus(data);
        if (data.clientId) setClientId(data.clientId);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchSources = useCallback(async (page = 1) => {
    try {
      const res = await apiFetch(`/api/sources?page=${page}&limit=10`);
      if (res.status === 401) return;
      const data = await res.json();
      if (data?.sources) setSourcePageData(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await apiFetch('/api/logs');
      if (res.status === 401) return;
      const data = await res.json();
      if (data?.logs) setLogPageData(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchBenchmarkSummary = useCallback(async () => {
    try {
      const res = await apiFetch('/api/benchmark/summary');
      if (res.status === 401) return;
      const data = await res.json();
      if (!data?.error) {
        setBenchmarkSummary({
          totalEvents: Number(data.totalEvents || 0),
          topEvents: Array.isArray(data.topEvents) ? data.topEvents : [],
          topRoutes: Array.isArray(data.topRoutes) ? data.topRoutes : [],
          lastEventAt: data.lastEventAt || null,
          source: data.source || 'memory',
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchBenchmarkReport = useCallback(async () => {
    try {
      const res = await apiFetch('/api/benchmark/report?windowDays=7');
      if (res.status === 401) return;
      const data = await res.json();
      if (!data?.error) {
        setBenchmarkReport({
          windowDays: Number(data.windowDays || 7),
          totals: {
            events: Number(data?.totals?.events || 0),
            sessions: Number(data?.totals?.sessions || 0),
          },
          funnel: {
            homeSessions: Number(data?.funnel?.homeSessions || 0),
            inAppSessions: Number(data?.funnel?.inAppSessions || 0),
            dashboardSessions: Number(data?.funnel?.dashboardSessions || 0),
            homeToInAppRate: Number(data?.funnel?.homeToInAppRate || 0),
            inAppToDashboardRate: Number(data?.funnel?.inAppToDashboardRate || 0),
            homeDropoffRate: Number(data?.funnel?.homeDropoffRate || 0),
            inAppDropoffRate: Number(data?.funnel?.inAppDropoffRate || 0),
          },
          nodeStats: Array.isArray(data.nodeStats) ? data.nodeStats : [],
          ctaStats: Array.isArray(data.ctaStats) ? data.ctaStats : [],
          updatedAt: data.updatedAt || null,
          source: data.source || 'memory',
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchGuilds = useCallback(async () => {
    setLoadingGuilds(true);
    try {
      const res = await apiFetch('/api/discord/guilds');
      if (!res.ok) return;
      const data = await res.json();
      setGuilds(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingGuilds(false);
    }
  }, []);

  const fetchChannels = useCallback(async (guildId: string) => {
    setLoadingChannels(true);
    try {
      const res = await apiFetch(`/api/discord/channels/${guildId}`);
      if (!res.ok) return;
      const data = await res.json();
      setChannels(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingChannels(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchStatus();
    fetchSources(1);
    fetchLogs();
    fetchBenchmarkSummary();
    fetchBenchmarkReport();
    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
      fetchBenchmarkSummary();
      fetchBenchmarkReport();
    }, SECTION_MOTION_TOKENS.dashboard.pollIntervalMs);
    return () => clearInterval(interval);
  }, [user, fetchBenchmarkReport, fetchBenchmarkSummary, fetchLogs, fetchSources, fetchStatus]);

  useEffect(() => {
    if (activeTab === 'sources' && user) {
      fetchGuilds();
    }
  }, [activeTab, fetchGuilds, user]);

  useEffect(() => {
    if (!selectedGuildId) {
      setChannels([]);
      return;
    }
    fetchChannels(selectedGuildId);
  }, [fetchChannels, selectedGuildId]);

  const displaySources = useMemo(() => sourcePageData.sources || [], [sourcePageData]);
  const displayLogs = useMemo(() => logPageData.logs || [], [logPageData]);
  const maxSourcePages = useMemo(() => Math.ceil(sourcePageData.total / sourcePageData.limit), [sourcePageData]);

  const categories = channels.filter((channel) => channel.type === 4).sort((a, b) => a.position - b.position);
  const textChannels = channels.filter((channel) => channel.type !== 4).sort((a, b) => a.position - b.position);
  const groupedChannels = useMemo(() => {
    const groups: Array<{ id: string; name: string; channels: ChannelItem[] }> = [];
    const uncategorized = textChannels.filter((channel) => !channel.parentId);
    if (uncategorized.length > 0) {
      groups.push({ id: 'uncategorized', name: '카테고리 없음', channels: uncategorized });
    }
    categories.forEach((category) => {
      const categoryChannels = textChannels.filter((channel) => channel.parentId === category.id);
      if (categoryChannels.length > 0) {
        groups.push({ id: category.id, name: category.name, channels: categoryChannels });
      }
    });
    return groups;
  }, [categories, textChannels]);

  const selectedGuild = guilds.find((guild) => guild.id === selectedGuildId);

  const handleAddSource = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!newUrl || !newName || !selectedGuildId || !selectedChannelId) return;

      trackBenchmarkEvent(BENCHMARK_EVENTS.sourceAddAttempt, {
        guildId: selectedGuildId,
        channelId: selectedChannelId,
      });

      const { valid, message } = validateYouTubeUrl(newUrl);
      if (!valid) {
        trackBenchmarkEvent(BENCHMARK_EVENTS.sourceAddResult, {
          success: false,
          reason: 'invalid_url',
        });
        setAddSourceStatus(message || dashboardText.status.invalidYoutubeUrl);
        setTimeout(() => setAddSourceStatus(''), 5000);
        return;
      }

      setAddSourceStatus(dashboardText.status.adding);
      try {
        const guild = guilds.find((item) => item.id === selectedGuildId);
        const channel = channels.find((item) => item.id === selectedChannelId);
        const res = await apiFetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: newUrl,
            name: newName,
            guildId: selectedGuildId,
            channelId: selectedChannelId,
            guildName: guild?.name,
            channelName: channel?.name,
          }),
        });

        if (res.ok) {
          trackBenchmarkEvent(BENCHMARK_EVENTS.sourceAddResult, {
            success: true,
            guildId: selectedGuildId,
            channelId: selectedChannelId,
          });
          setNewUrl('');
          setNewName('');
          setAddSourceStatus(dashboardText.status.addSuccess);
          await fetchSources(1);
          return;
        }

        const data = await res.json();
        trackBenchmarkEvent(BENCHMARK_EVENTS.sourceAddResult, {
          success: false,
          reason: data.error || 'api_error',
        });
        setAddSourceStatus(`${dashboardText.status.addFailedPrefix} ${data.error || '알 수 없는 오류'}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        trackBenchmarkEvent(BENCHMARK_EVENTS.sourceAddResult, {
          success: false,
          reason: message,
        });
        setAddSourceStatus(`${dashboardText.status.addFailedPrefix} ${message}`);
      }

      setTimeout(() => setAddSourceStatus(''), 5000);
    },
    [channels, fetchSources, guilds, newName, newUrl, selectedChannelId, selectedGuildId],
  );

  const handleDeleteSource = useCallback(
    async (id: number) => {
      if (!window.confirm('정말로 이 알림을 삭제하시겠습니까?')) return;
      await apiFetch(`/api/sources/${id}`, { method: 'DELETE' });
      fetchSources(sourcePageData.page);
    },
    [fetchSources, sourcePageData.page],
  );

  const handleTestTrigger = useCallback(async () => {
    trackBenchmarkEvent(BENCHMARK_EVENTS.testTriggerAttempt, {
      hasChannel: Boolean(selectedChannelId),
    });

    if (!selectedChannelId) {
      trackBenchmarkEvent(BENCHMARK_EVENTS.testTriggerResult, {
        success: false,
        reason: 'channel_required',
      });
      setTestResult(dashboardText.status.testChannelRequired);
      return;
    }

    const { valid, message } = validateYouTubeUrl(testUrl);
    if (!valid) {
      trackBenchmarkEvent(BENCHMARK_EVENTS.testTriggerResult, {
        success: false,
        reason: message || 'invalid_url',
      });
      setTestResult(`${dashboardText.status.errorPrefix} ${message || dashboardText.status.invalidYoutubeUrl}`);
      return;
    }

    setTestResult(dashboardText.status.testSending);
    try {
      const res = await apiFetch('/api/test-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl, channelId: selectedChannelId }),
      });
      const data = await res.json();
      if (res.ok) {
        trackBenchmarkEvent(BENCHMARK_EVENTS.testTriggerResult, {
          success: true,
        });
        setTestResult(dashboardText.status.testSuccess);
        fetchLogs();
        return;
      }
      trackBenchmarkEvent(BENCHMARK_EVENTS.testTriggerResult, {
        success: false,
        reason: data.error || 'api_error',
      });
      setTestResult(`${dashboardText.status.errorPrefix} ${data.error}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      trackBenchmarkEvent(BENCHMARK_EVENTS.testTriggerResult, {
        success: false,
        reason: message,
      });
      setTestResult(`${dashboardText.status.errorPrefix} ${message}`);
    }
  }, [fetchLogs, selectedChannelId, testUrl]);

  return (
    <div className="surface-page surface-bridge hud-grid min-h-screen">
      <a href="#dashboard-main" className="skip-link">{commonText.helper.skipToContent}</a>
      <AppHeader
        title={dashboardContent.header.title}
        animated
        actions={(
          <div className="flex items-center gap-4">
            <TopSectionSwitcher compact includeExternal={false} />
            <UiButton href={dashboardInviteUrl} variant="accent" size="sm" ariaLabel={dashboardContent.header.inviteBot}>
              {dashboardContent.header.inviteBot} <ExternalLink className="h-4 w-4" />
            </UiButton>
            <div className="hidden text-sm text-current md:block">{user?.username}</div>
            <UiButton onClick={onLogout as (() => void) | undefined} variant="ghost" size="sm" className="hover:border-zinc-400 hover:text-current">
              <LogOut className="h-4 w-4" /> {dashboardContent.header.logout}
            </UiButton>
          </div>
        )}
      />

      <main id="dashboard-main" className={`section-wrap section-v-80 ${UI_PRESETS.borderXTop}`}>
        <div className="mb-4">
          <div className={`mono-data inline-flex items-center gap-2 ${UI_PRESETS.borderBase} bg-zinc-950/70 px-3 py-1.5 text-xs tracking-[0.2em] ${UI_PRESETS.inkText}`}>
            OPERATIONS MODE
          </div>
        </div>
        <motion.section
          initial={{ opacity: 0, y: SECTION_MOTION_TOKENS.dashboard.statusRiseOffset }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: SECTION_MOTION_TOKENS.dashboard.statusFadeDuration, ease: SECTION_MOTION_TOKENS.revealLine.ease }}
          className={`io-reveal mb-8 ${UI_PRESETS.borderBottom} pb-8`}
        >
          <div className="mono-data mb-6 text-xs tracking-[0.2em] text-current">{dashboardContent.realtime.title}</div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={`mb-3 h-px origin-left ${UI_PRESETS.accentLineSoft}`}
          />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className={`grid grid-cols-1 ${UI_PRESETS.gridFrame} md:grid-cols-3`}
          >
            <SurfaceCard
              as={motion.article}
              variants={staggerItem}
              onHoverStart={() => setStatHoverTick((prev) => ({ ...prev, status: prev.status + 1 }))}
              hoverable
              className={`${UI_PRESETS.gridCell} bg-zinc-900/35 p-6`}
            >
              <div className="mono-data text-xs tracking-[0.14em] text-current">{dashboardContent.realtime.status}</div>
              <div className="mono-data mt-4 text-3xl font-medium">
                {status.online ? <span className={UI_PRESETS.accentText}>{dashboardContent.realtime.online}</span> : <span className="text-current">{dashboardContent.realtime.offline}</span>}
              </div>
              <div className="mt-2 text-xs text-current">
                {dashboardContent.realtime.integrityIndex}: <RollingValue value={status.online ? 98 : 42} trigger={statHoverTick.status} className={UI_PRESETS.accentText} suffix="%" />
              </div>
            </SurfaceCard>
            <SurfaceCard
              as={motion.article}
              variants={staggerItem}
              onHoverStart={() => setStatHoverTick((prev) => ({ ...prev, guilds: prev.guilds + 1 }))}
              hoverable
              className={`${UI_PRESETS.gridCell} bg-zinc-900/35 p-6`}
            >
              <div className="mono-data text-xs tracking-[0.14em] text-current">{dashboardContent.realtime.connectedGuilds}</div>
              <div className="mono-data mt-4 text-3xl font-medium text-current">
                <RollingValue value={status.guildsCount} trigger={statHoverTick.guilds} className="text-current" />
              </div>
            </SurfaceCard>
            <SurfaceCard
              as={motion.article}
              variants={staggerItem}
              onHoverStart={() => setStatHoverTick((prev) => ({ ...prev, sources: prev.sources + 1 }))}
              hoverable
              className={`${UI_PRESETS.gridCell} bg-zinc-900/35 p-6`}
            >
              <div className="mono-data text-xs tracking-[0.14em] text-current">{dashboardContent.realtime.trackedSources}</div>
              <div className="mono-data mt-4 text-3xl font-medium text-current">
                <RollingValue value={sourcePageData.total} trigger={statHoverTick.sources} className="text-current" />
              </div>
            </SurfaceCard>
          </motion.div>
        </motion.section>

        <section className={`io-reveal mb-8 flex flex-wrap items-center gap-2 ${UI_PRESETS.borderBottom} pb-7`}>
          <UiButton
            onClick={() => setActiveTab('overview')}
            variant="tab"
            active={activeTab === 'overview'}
            benchmarkEvent={BENCHMARK_EVENTS.dashboardTabSwitch}
            benchmarkId="overview"
            benchmarkLabel={dashboardContent.tabs.overview}
            benchmarkArea="dashboard-tabs"
          >
            <span className="inline-flex items-center gap-2"><Activity className="h-4 w-4" /> {dashboardContent.tabs.overview}</span>
          </UiButton>
          <UiButton
            onClick={() => setActiveTab('sources')}
            variant="tab"
            active={activeTab === 'sources'}
            benchmarkEvent={BENCHMARK_EVENTS.dashboardTabSwitch}
            benchmarkId="sources"
            benchmarkLabel={dashboardContent.tabs.sources}
            benchmarkArea="dashboard-tabs"
          >
            <span className="inline-flex items-center gap-2"><Bell className="h-4 w-4" /> {dashboardContent.tabs.sources}</span>
          </UiButton>
        </section>

        <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.section
            key="overview-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="section-cluster"
          >
            <div className="grid grid-cols-1 gap-card-lg xl:grid-cols-2">
              <RadarQuantCard title={dashboardContent.overview.radarTitle} subtitle={dashboardContent.overview.radarSubtitle} metrics={dashboardContent.overview.quant.radarMetrics} />
              <GlitchLineQuantCard title={dashboardContent.overview.signalTitle} subtitle={dashboardContent.overview.signalSubtitle} labels={dashboardContent.overview.quant.lineLabels} values={dashboardContent.overview.quant.lineValues} />
            </div>
            <div className="grid grid-cols-1">
              <PremiumInsightPaywallCard title={dashboardContent.overview.premiumTitle} subtitle={dashboardContent.overview.premiumSubtitle} lockedRows={dashboardContent.overview.quant.premiumRows} />
            </div>
            <SurfaceCard as="section" hoverable className={`io-reveal rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}>
              <div className="mono-data text-xs tracking-[0.14em] text-current">{dashboardContent.overview.benchmarkSubtitle}</div>
              <h3 className="mt-2 text-lg font-medium text-current">{dashboardContent.overview.benchmarkTitle}</h3>

              <div className={`mt-4 grid grid-cols-1 ${UI_PRESETS.gridFrame} md:grid-cols-2`}>
                <SurfaceCard className={`${UI_PRESETS.gridCell} bg-zinc-950 p-4`}>
                  <div className="mono-data text-xs text-current">{dashboardContent.overview.benchmarkTotal}</div>
                  <div className="mono-data mt-2 text-2xl text-current">{benchmarkSummary.totalEvents}</div>
                  <div className="mt-2 text-xs text-current">
                    {dashboardContent.overview.benchmarkUpdated}: {benchmarkSummary.lastEventAt ? new Date(benchmarkSummary.lastEventAt).toLocaleString() : '-'}
                  </div>
                </SurfaceCard>
                <SurfaceCard className={`${UI_PRESETS.gridCell} bg-zinc-950 p-4`}>
                  <div className="mono-data text-xs text-current">SOURCE</div>
                  <div className="mono-data mt-2 text-2xl text-current">{benchmarkSummary.source.toUpperCase()}</div>
                </SurfaceCard>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-950 p-4`}>
                  <div className="mono-data mb-2 text-xs text-current">{dashboardContent.overview.benchmarkTopEvents}</div>
                  {benchmarkSummary.topEvents.length === 0 ? (
                    <p className="text-xs text-current">{dashboardContent.overview.benchmarkNoData}</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-current">
                      {benchmarkSummary.topEvents.slice(0, 6).map((event) => (
                        <li key={event.name} className="flex items-center justify-between">
                          <span>{event.name}</span>
                          <span className="mono-data">{event.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </SurfaceCard>

                <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-950 p-4`}>
                  <div className="mono-data mb-2 text-xs text-current">{dashboardContent.overview.benchmarkTopRoutes}</div>
                  {benchmarkSummary.topRoutes.length === 0 ? (
                    <p className="text-xs text-current">{dashboardContent.overview.benchmarkNoData}</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-current">
                      {benchmarkSummary.topRoutes.slice(0, 6).map((route) => (
                        <li key={route.path} className="flex items-center justify-between gap-2">
                          <span className="line-clamp-1">{route.path}</span>
                          <span className="mono-data">{route.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </SurfaceCard>
              </div>
            </SurfaceCard>

            <SurfaceCard as="section" hoverable className={`io-reveal rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}>
              <div className="mono-data text-xs tracking-[0.14em] text-current">{dashboardContent.overview.reportSubtitle}</div>
              <h3 className="mt-2 text-lg font-medium text-current">{dashboardContent.overview.reportTitle}</h3>

              <div className={`mt-4 grid grid-cols-1 ${UI_PRESETS.gridFrame} md:grid-cols-2`}>
                <SurfaceCard className={`${UI_PRESETS.gridCell} bg-zinc-950 p-4`}>
                  <div className="mono-data text-xs text-current">{dashboardContent.overview.reportSessions}</div>
                  <div className="mono-data mt-2 text-2xl text-current">{benchmarkReport.totals.sessions}</div>
                  <div className="mt-2 text-xs text-current">{dashboardContent.overview.reportWindow}: {benchmarkReport.windowDays}d</div>
                </SurfaceCard>
                <SurfaceCard className={`${UI_PRESETS.gridCell} bg-zinc-950 p-4`}>
                  <div className="mono-data text-xs text-current">UPDATED</div>
                  <div className="mt-2 text-xs text-current">{benchmarkReport.updatedAt ? new Date(benchmarkReport.updatedAt).toLocaleString() : '-'}</div>
                </SurfaceCard>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-950 p-4`}>
                  <div className="mono-data text-xs text-current">{dashboardContent.overview.reportHomeToInApp}</div>
                  <div className="mono-data mt-2 text-2xl text-current">{benchmarkReport.funnel.homeToInAppRate}%</div>
                </SurfaceCard>
                <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-950 p-4`}>
                  <div className="mono-data text-xs text-current">{dashboardContent.overview.reportInAppToOps}</div>
                  <div className="mono-data mt-2 text-2xl text-current">{benchmarkReport.funnel.inAppToDashboardRate}%</div>
                </SurfaceCard>
                <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-950 p-4`}>
                  <div className="mono-data text-xs text-current">{dashboardContent.overview.reportHomeDropoff}</div>
                  <div className="mono-data mt-2 text-2xl text-current">{benchmarkReport.funnel.homeDropoffRate}%</div>
                </SurfaceCard>
                <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-950 p-4`}>
                  <div className="mono-data text-xs text-current">{dashboardContent.overview.reportInAppDropoff}</div>
                  <div className="mono-data mt-2 text-2xl text-current">{benchmarkReport.funnel.inAppDropoffRate}%</div>
                </SurfaceCard>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-950 p-4`}>
                  <div className="mono-data mb-2 text-xs text-current">{dashboardContent.overview.reportTopCtas}</div>
                  {benchmarkReport.ctaStats.length === 0 ? (
                    <p className="text-xs text-current">{dashboardContent.overview.benchmarkNoData}</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-current">
                      {benchmarkReport.ctaStats.slice(0, 6).map((cta) => (
                        <li key={cta.label} className="flex items-center justify-between gap-2">
                          <span className="line-clamp-1">{cta.label}</span>
                          <span className="mono-data">{cta.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </SurfaceCard>

                <SurfaceCard className={`rounded-xl ${UI_PRESETS.borderBase} bg-zinc-950 p-4`}>
                  <div className="mono-data mb-2 text-xs text-current">{dashboardContent.overview.reportTopNodes}</div>
                  {benchmarkReport.nodeStats.length === 0 ? (
                    <p className="text-xs text-current">{dashboardContent.overview.benchmarkNoData}</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-current">
                      {benchmarkReport.nodeStats.slice(0, 6).map((node) => (
                        <li key={node.path} className="flex items-center justify-between gap-2">
                          <span className="line-clamp-1">{node.path}</span>
                          <span className="mono-data">{node.eventsCount}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </SurfaceCard>
              </div>
            </SurfaceCard>
            <SurfaceCard as="section" hoverable className={`io-reveal rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35`}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`h-px origin-left ${UI_PRESETS.accentLineSoft}`}
              />
              <div className={`${UI_PRESETS.borderBottom} px-6 py-4 text-sm text-current`}>{dashboardContent.overview.logsTitle}</div>
              <div className="max-h-[480px] divide-y divide-zinc-800 overflow-y-auto">
                {displayLogs.length === 0 && <div className="p-8 text-sm text-current">{dashboardContent.overview.logsEmpty}</div>}
                {displayLogs.map((log) => (
                  <div key={log.id} className={`flex items-start gap-4 ${UI_PRESETS.borderLeft} px-6 py-3 text-sm`}>
                    <span className="mono-data w-24 shrink-0 text-xs text-current">{new Date(log.created_at || Date.now()).toLocaleTimeString()}</span>
                    <span className={`${log.type === 'success' ? UI_PRESETS.accentText : 'text-current'}`}>{log.message}</span>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </motion.section>
        )}

        {activeTab === 'sources' && (
          <motion.div
            key="sources-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="section-cluster"
          >
            <SurfaceCard as="section" hoverable className={`io-reveal rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`mb-5 h-px origin-left ${UI_PRESETS.accentLineSoft}`}
              />
              <h2 className="type-h2 mb-6">{dashboardContent.sourceForm.title}</h2>
              <form onSubmit={handleAddSource} className="space-y-6">
                <div className="grid grid-cols-1 gap-card md:grid-cols-2">
                  <FormInput
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder={dashboardContent.sourceForm.placeholders.sourceName}
                  />
                  <FormInput
                    value={newUrl}
                    onChange={(event) => setNewUrl(event.target.value)}
                    placeholder={dashboardContent.sourceForm.placeholders.sourceUrl}
                  />
                  <FormSelect
                    value={selectedGuildId}
                    onChange={(event) => setSelectedGuildId(event.target.value)}
                    disabled={loadingGuilds}
                  >
                    <option value="">{loadingGuilds ? dashboardContent.sourceForm.selects.loadingGuilds : dashboardContent.sourceForm.selects.selectGuild}</option>
                    {guilds.map((guild) => (
                      <option key={guild.id} value={guild.id}>
                        {guild.name} {guild.botInGuild ? '' : dashboardContent.sourceForm.selects.botInviteRequired}
                      </option>
                    ))}
                  </FormSelect>

                  <FormSelect
                    value={selectedChannelId}
                    onChange={(event) => setSelectedChannelId(event.target.value)}
                    disabled={!selectedGuildId || !selectedGuild?.botInGuild || loadingChannels}
                  >
                    <option value="">{loadingChannels ? dashboardContent.sourceForm.selects.loadingChannels : dashboardContent.sourceForm.selects.selectChannel}</option>
                    {groupedChannels.map((group) => (
                      <optgroup key={group.id} label={group.name}>
                        {group.channels.map((channel) => (
                          <option key={channel.id} value={channel.id}>
                            {channel.name} ({channel.type === 15 ? dashboardContent.sourceForm.selects.channelTypeForum : channel.type === 5 ? dashboardContent.sourceForm.selects.channelTypeNotice : dashboardContent.sourceForm.selects.channelTypeText})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </FormSelect>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-current">
                    {selectedGuildId && selectedGuild && !selectedGuild.botInGuild
                      ? dashboardContent.sourceForm.helper.noBotInGuild
                      : dashboardContent.sourceForm.helper.selectGuide}
                  </div>
                  <UiButton
                    type="submit"
                    disabled={!newUrl || !newName || !selectedGuildId || !selectedChannelId}
                    variant="solid"
                    className="disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" /> {dashboardContent.sourceForm.actions.addSource}
                  </UiButton>
                </div>

                {addSourceStatus && (
                  <StatusPill text={addSourceStatus} tone="auto" />
                )}
              </form>
            </SurfaceCard>

            <SurfaceCard as="section" hoverable className={`io-reveal rounded-xl ${UI_PRESETS.borderBase} bg-zinc-900/35 p-6`}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`mb-5 h-px origin-left ${UI_PRESETS.accentLineSoft}`}
              />
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">{dashboardContent.sourceForm.registered.title}</h3>
                <span className="mono-data text-xs text-current">{dashboardContent.sourceForm.registered.totalPrefix} {sourcePageData.total}</span>
              </div>

              {displaySources.length === 0 ? (
                <div className={`rounded-full ${UI_PRESETS.borderBase} bg-zinc-950/70 p-6 text-sm text-current`}>{dashboardContent.sourceForm.registered.empty}</div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className={`grid grid-cols-1 ${UI_PRESETS.gridFrame} lg:grid-cols-2`}
                >
                  {displaySources.map((source) => (
                    <SurfaceCard as={motion.article} variants={staggerItem} key={source.id} className={`${UI_PRESETS.gridCell} bg-zinc-950 p-4`}>
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h4 className="line-clamp-1 text-sm font-medium text-current">{source.name}</h4>
                        <UiButton onClick={() => handleDeleteSource(source.id)} variant="ghost" size="sm" className={`!h-7 !w-7 !p-0 !border-none !text-current ${UI_PRESETS.accentTextHoverBang}`} title={dashboardContent.sourceForm.actions.delete}>
                          <Trash2 className="h-4 w-4" />
                        </UiButton>
                      </div>

                      <div className="space-y-2 text-xs text-current">
                        <div className="flex items-start gap-2">
                          <LinkIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <a href={source.url} target="_blank" rel="noreferrer" className="micro-underline mono-data line-clamp-1 transition hover:text-current">
                            {source.url}
                          </a>
                        </div>
                        <div>{dashboardContent.sourceForm.registered.server}: {source.guild_name || dashboardContent.sourceForm.registered.unknownInfo}</div>
                        <div>{dashboardContent.sourceForm.registered.channel}: {source.channel_name || dashboardContent.sourceForm.registered.unknownInfo}</div>
                      </div>
                    </SurfaceCard>
                  ))}
                </motion.div>
              )}

              {maxSourcePages > 1 && (
                <div className={`mt-5 flex items-center justify-between ${UI_PRESETS.borderTop} pt-4 text-sm`}>
                  <span className="mono-data text-current">
                    {dashboardContent.sourceForm.registered.pagePrefix} {sourcePageData.page} / {maxSourcePages}
                  </span>
                  <div className="flex items-center gap-2">
                    <UiButton
                      onClick={() => fetchSources(Math.max(1, sourcePageData.page - 1))}
                      disabled={sourcePageData.page === 1}
                      variant="ghost"
                      size="sm"
                      className="hover:border-zinc-400 hover:text-current disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" /> {dashboardContent.sourceForm.actions.prev}
                    </UiButton>
                    <UiButton
                      onClick={() => fetchSources(Math.min(maxSourcePages, sourcePageData.page + 1))}
                      disabled={sourcePageData.page === maxSourcePages}
                      variant="ghost"
                      size="sm"
                      className="hover:border-zinc-400 hover:text-current disabled:opacity-40"
                    >
                      {dashboardContent.sourceForm.actions.next} <ChevronRight className="h-4 w-4" />
                    </UiButton>
                  </div>
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard as="section" hoverable className={`io-reveal rounded-xl border ${UI_PRESETS.accentBorderFaint} bg-zinc-900/35 p-6`}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`mb-5 h-px origin-left ${UI_PRESETS.accentLineStrongest}`}
              />
              <h3 className={`type-h2 mb-3 font-medium ${UI_PRESETS.accentText}`}>{dashboardContent.rollingTest.title}</h3>
              <p className="type-body mb-4 text-current">{dashboardContent.rollingTest.description}</p>
              <div className="flex flex-col gap-3 md:flex-row">
                <FormInput
                  value={testUrl}
                  onChange={(event) => setTestUrl(event.target.value)}
                  className={`w-full border-zinc-700 ${UI_PRESETS.accentFocusBorder}`}
                  placeholder={dashboardContent.sourceForm.placeholders.testUrl}
                />
                <UiButton
                  onClick={handleTestTrigger}
                  disabled={!status.online || !selectedChannelId}
                  variant="solid"
                  className="justify-center disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Play className="h-4 w-4" /> {dashboardContent.sourceForm.actions.testSend}
                </UiButton>
              </div>
              {testResult && (
                <StatusPill text={testResult} tone="auto" className="mt-4" />
              )}
            </SurfaceCard>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
      <BackToTopButton />
    </div>
  );
};



