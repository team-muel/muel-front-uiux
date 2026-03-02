import {
  Client,
  GatewayIntentBits,
  ChannelType,
  ForumChannel,
  AttachmentBuilder,
  TextChannel,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Interaction,
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { lookup, setDefaultResultOrder } from 'node:dns';
import { randomBytes } from 'node:crypto';
import { supabase, isSupabaseConfigured } from './supabase';
import { isResearchPresetKey, type ResolvedResearchPreset } from './content/researchContent';
import { isResolvedResearchPreset } from './lib/researchPresetValidation';

const loginTimeoutMs = Number(process.env.DISCORD_LOGIN_TIMEOUT_MS || 30000);
const reconnectDelayMs = Number(process.env.DISCORD_RECONNECT_DELAY_MS || 8000);

setDefaultResultOrder('ipv4first');
console.log('[RENDER_EVENT] DNS_RESULT_ORDER value=ipv4first scope=src_bot');

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildPresences,
];

// Create a new client instance
export const client = new Client({
  intents,
});

type BotRuntimeStatus = {
  started: boolean;
  ready: boolean;
  wsStatus: number;
  tokenPresent: boolean;
  reconnectQueued: boolean;
  reconnectAttempts: number;
  lastReadyAt: string | null;
  lastLoginAttemptAt: string | null;
  lastLoginErrorAt: string | null;
  lastLoginError: string | null;
  lastDisconnectAt: string | null;
  lastDisconnectCode: number | null;
  lastDisconnectReason: string | null;
  lastInvalidatedAt: string | null;
};

const botRuntimeStatus: BotRuntimeStatus = {
  started: false,
  ready: false,
  wsStatus: client.ws.status,
  tokenPresent: false,
  reconnectQueued: false,
  reconnectAttempts: 0,
  lastReadyAt: null,
  lastLoginAttemptAt: null,
  lastLoginErrorAt: null,
  lastLoginError: null,
  lastDisconnectAt: null,
  lastDisconnectCode: null,
  lastDisconnectReason: null,
  lastInvalidatedAt: null,
};

let activeBotToken: string | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let reconnectInFlight = false;

const updateBotRuntimeWsStatus = () => {
  botRuntimeStatus.wsStatus = client.ws.status;
};

const scheduleBotReconnect = (reason: string, delayMs = reconnectDelayMs) => {
  if (!activeBotToken) {
    return;
  }

  if (reconnectTimer || reconnectInFlight) {
    return;
  }

  botRuntimeStatus.reconnectQueued = true;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    botRuntimeStatus.reconnectQueued = false;
    if (!activeBotToken || client.isReady() || reconnectInFlight) {
      updateBotRuntimeWsStatus();
      return;
    }

    reconnectInFlight = true;
    botRuntimeStatus.reconnectAttempts += 1;
    botRuntimeStatus.lastLoginAttemptAt = new Date().toISOString();
    updateBotRuntimeWsStatus();

    console.log(`[RENDER_EVENT] BOT_RECONNECT_ATTEMPT n=${botRuntimeStatus.reconnectAttempts} reason=${reason}`);

    try {
      try {
        client.destroy();
      } catch {
        // ignore destroy errors
      }

      await client.login(activeBotToken);
      updateBotRuntimeWsStatus();
      console.log(`[RENDER_EVENT] BOT_RECONNECT_PROMISE_RESOLVED reason=${reason}`);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      botRuntimeStatus.lastLoginErrorAt = new Date().toISOString();
      botRuntimeStatus.lastLoginError = errMessage;
      updateBotRuntimeWsStatus();
      console.log(`[RENDER_EVENT] BOT_RECONNECT_FAILED reason=${reason}`);
      console.error('[Discord Bot] Reconnect failed:', error);
      scheduleBotReconnect('reconnect_failed', Math.max(5000, reconnectDelayMs));
    } finally {
      reconnectInFlight = false;
    }
  }, Math.max(1000, delayMs));
};

export const getBotRuntimeStatus = () => {
  updateBotRuntimeWsStatus();
  return {
    ...botRuntimeStatus,
  };
};

type AuditSource = 'upsert' | 'restore';

const presetAdminUserIds = new Set(
  (process.env.RESEARCH_PRESET_ADMIN_USER_IDS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

const studioBaseUrlRaw =
  process.env.RESEARCH_STUDIO_URL ||
  process.env.STUDIO_BASE_URL ||
  process.env.APP_BASE_URL ||
  '';
const presetMutationCooldownMs = Number(process.env.RESEARCH_PRESET_MUTATION_COOLDOWN_MS || 8000);

const studioBaseUrl = studioBaseUrlRaw.trim().replace(/\/+$/, '');
const presetMutationLocks = new Map<string, number>();

const isPresetAdmin = (userId: string) => {
  return presetAdminUserIds.size > 0 && presetAdminUserIds.has(userId);
};

const buildStudioPresetLink = (presetKey: string, historyId?: string) => {
  if (!studioBaseUrl) {
    return null;
  }

  try {
    const url = new URL('/studio', studioBaseUrl);
    url.searchParams.set('preset', presetKey);
    if (historyId) {
      url.searchParams.set('historyId', historyId);
    }
    url.hash = 'preset-history';
    return url.toString();
  } catch {
    return null;
  }
};

const appendStudioPresetLink = (message: string, presetKey: string, historyId?: string) => {
  const link = buildStudioPresetLink(presetKey, historyId);
  if (!link) {
    return message;
  }

  return `${message}\nStudio: ${link}`;
};

const acquirePresetMutationLock = (lockKey: string) => {
  const now = Date.now();
  const activeUntil = presetMutationLocks.get(lockKey) || 0;
  if (activeUntil > now) {
    return Math.ceil((activeUntil - now) / 1000);
  }

  presetMutationLocks.set(lockKey, now + Math.max(1000, presetMutationCooldownMs));
  return 0;
};

const releasePresetMutationLock = (lockKey: string) => {
  presetMutationLocks.delete(lockKey);
};

const PRESET_RESTORE_BUTTON_PREFIX = 'preset_restore';
const PRESET_HISTORY_PAGE_BUTTON_PREFIX = 'preset_history_page';
const PRESET_HISTORY_PAGE_SIZE = 5;

const buildPresetRestoreButtonCustomId = (presetKey: string, historyId: string, requesterUserId: string) => {
  return `${PRESET_RESTORE_BUTTON_PREFIX}|${presetKey}|${historyId}|${requesterUserId}`;
};

const parsePresetRestoreButtonCustomId = (customId: string) => {
  const [prefix, presetKey, historyId, requesterUserId] = customId.split('|');
  if (prefix !== PRESET_RESTORE_BUTTON_PREFIX) {
    return null;
  }

  if (!presetKey || !historyId || !requesterUserId) {
    return null;
  }

  return {
    presetKey,
    historyId,
    requesterUserId,
  };
};

const buildPresetHistoryPageButtonCustomId = (presetKey: string, requesterUserId: string, pageIndex: number, limit: number) => {
  return `${PRESET_HISTORY_PAGE_BUTTON_PREFIX}|${presetKey}|${requesterUserId}|${pageIndex}|${limit}`;
};

const parsePresetHistoryPageButtonCustomId = (customId: string) => {
  const [prefix, presetKey, requesterUserId, pageIndexRaw, limitRaw] = customId.split('|');
  if (prefix !== PRESET_HISTORY_PAGE_BUTTON_PREFIX) {
    return null;
  }

  const pageIndex = Number(pageIndexRaw);
  const limit = Number(limitRaw);
  if (!presetKey || !requesterUserId || !Number.isInteger(pageIndex) || pageIndex < 0 || !Number.isInteger(limit) || limit < 1) {
    return null;
  }

  return {
    presetKey,
    requesterUserId,
    pageIndex,
    limit,
  };
};

const presetCommandSpecs = [
  new SlashCommandBuilder()
    .setName('preset-history')
    .setDescription('Research preset 변경 이력을 조회합니다 (관리자 전용).')
    .addStringOption((option) =>
      option
        .setName('preset_key')
        .setDescription('조회할 프리셋 키')
        .setRequired(true)
        .addChoices(
          { name: 'embedded', value: 'embedded' },
          { name: 'studio', value: 'studio' },
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('조회 건수 (1~20, 기본 10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20),
    ),
  new SlashCommandBuilder()
    .setName('preset-restore')
    .setDescription('Research preset 이력 스냅샷을 복원합니다 (관리자 전용).')
    .addStringOption((option) =>
      option
        .setName('preset_key')
        .setDescription('복원할 프리셋 키')
        .setRequired(true)
        .addChoices(
          { name: 'embedded', value: 'embedded' },
          { name: 'studio', value: 'studio' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('history_id')
        .setDescription('복원할 이력 항목 ID (UUID)')
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName('preset-upsert')
    .setDescription('Research preset payload를 직접 업서트합니다 (관리자 전용).')
    .addStringOption((option) =>
      option
        .setName('preset_key')
        .setDescription('업서트할 프리셋 키')
        .setRequired(true)
        .addChoices(
          { name: 'embedded', value: 'embedded' },
          { name: 'studio', value: 'studio' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('payload_json')
        .setDescription('Resolved preset JSON payload')
        .setRequired(true)
        .setMaxLength(6000),
    ),
  new SlashCommandBuilder()
    .setName('preset-upsert-from-history')
    .setDescription('이력 payload를 읽어 대상 preset으로 업서트합니다 (관리자 전용).')
    .addStringOption((option) =>
      option
        .setName('source_preset_key')
        .setDescription('원본 이력이 속한 프리셋 키')
        .setRequired(true)
        .addChoices(
          { name: 'embedded', value: 'embedded' },
          { name: 'studio', value: 'studio' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('history_id')
        .setDescription('가져올 이력 항목 ID (UUID)')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('target_preset_key')
        .setDescription('업서트할 대상 프리셋 키')
        .setRequired(true)
        .addChoices(
          { name: 'embedded', value: 'embedded' },
          { name: 'studio', value: 'studio' },
        ),
    ),
];

const registerPresetCommands = async () => {
  if (!client.application) {
    return;
  }

  const payload = presetCommandSpecs.map((command) => command.toJSON());
  const guildId = (process.env.DISCORD_COMMAND_GUILD_ID || '').trim();

  if (guildId) {
    await client.application.commands.set(payload, guildId);
    console.log(`[RENDER_EVENT] BOT_COMMANDS_REGISTERED scope=guild guild=${guildId} count=${payload.length}`);
    return;
  }

  await client.application.commands.set(payload);
  console.log(`[RENDER_EVENT] BOT_COMMANDS_REGISTERED scope=global count=${payload.length}`);
};

const appendPresetAudit = async (params: {
  presetKey: string;
  actorUserId: string;
  actorUsername: string;
  source: AuditSource;
  payload: ResolvedResearchPreset;
  metadata?: Record<string, string | number | boolean | null>;
}) => {
  if (!isSupabaseConfigured) {
    return;
  }

  await supabase.from('research_preset_audit').insert([
    {
      preset_key: params.presetKey,
      actor_user_id: params.actorUserId,
      actor_username: params.actorUsername,
      source: params.source,
      payload: params.payload,
      metadata: params.metadata || {},
      created_at: new Date().toISOString(),
    },
  ]);
};

const appendPresetBenchmarkEvent = async (params: {
  userId: string;
  name: string;
  payload: Record<string, string | number | boolean | null>;
}) => {
  if (!isSupabaseConfigured) {
    return;
  }

  await supabase.from('benchmark_events').insert([
    {
      user_id: params.userId,
      event_id: randomBytes(8).toString('hex'),
      name: params.name,
      payload: params.payload,
      path: '/discord/slash',
      created_at: new Date().toISOString(),
    },
  ]);
};

const ensurePresetAdminInteraction = async (interaction: ChatInputCommandInteraction) => {
  if (!isSupabaseConfigured) {
    await interaction.reply({
      content: 'Supabase가 설정되지 않아 이 명령을 실행할 수 없습니다.',
      ephemeral: true,
    });
    return false;
  }

  if (!presetAdminUserIds.size) {
    await interaction.reply({
      content: 'RESEARCH_PRESET_ADMIN_USER_IDS allowlist가 설정되지 않았습니다.',
      ephemeral: true,
    });
    return false;
  }

  if (!isPresetAdmin(interaction.user.id)) {
    await interaction.reply({
      content: '관리자 권한이 없어 이 명령을 실행할 수 없습니다.',
      ephemeral: true,
    });
    return false;
  }

  return true;
};

const formatHistoryRowsForDiscord = (rows: Array<{
  id: string;
  source: string;
  actor_username: string;
  created_at: string;
  metadata?: unknown;
}>, startIndex = 0) => {
  return rows
    .map((row, index) => {
      const restoredFrom =
        row.metadata && typeof row.metadata === 'object' && (row.metadata as Record<string, unknown>).restoredFromHistoryId
          ? ` · from ${(row.metadata as Record<string, unknown>).restoredFromHistoryId}`
          : '';
      const ts = row.created_at ? new Date(row.created_at).toLocaleString('ko-KR') : '-';
      return `${startIndex + index + 1}. [${row.source.toUpperCase()}] ${row.id} · ${row.actor_username} · ${ts}${restoredFrom}`;
    })
    .join('\n');
};

const buildPresetHistoryReply = (params: {
  presetKey: string;
  rows: Array<{
    id: string;
    source: string;
    actor_username: string;
    created_at: string;
    metadata?: unknown;
  }>;
  requesterUserId: string;
  pageIndex: number;
  limit: number;
}) => {
  const pageCount = Math.max(1, Math.ceil(params.rows.length / PRESET_HISTORY_PAGE_SIZE));
  const safePageIndex = Math.max(0, Math.min(pageCount - 1, params.pageIndex));
  const start = safePageIndex * PRESET_HISTORY_PAGE_SIZE;
  const pageRows = params.rows.slice(start, start + PRESET_HISTORY_PAGE_SIZE);

  const body = formatHistoryRowsForDiscord(pageRows, start).slice(0, 1800);
  const content = appendStudioPresetLink(
    `preset=${params.presetKey} recent history (page ${safePageIndex + 1}/${pageCount})\n${body}`,
    params.presetKey,
  );

  const restoreButtons = pageRows.map((row, index) =>
    new ButtonBuilder()
      .setCustomId(buildPresetRestoreButtonCustomId(params.presetKey, row.id, params.requesterUserId))
      .setLabel(`Restore ${start + index + 1}`)
      .setStyle(ButtonStyle.Secondary),
  );

  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  if (restoreButtons.length) {
    components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(restoreButtons));
  }

  if (pageCount > 1) {
    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(buildPresetHistoryPageButtonCustomId(params.presetKey, params.requesterUserId, safePageIndex - 1, params.limit))
          .setLabel('Prev')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(safePageIndex <= 0),
        new ButtonBuilder()
          .setCustomId(buildPresetHistoryPageButtonCustomId(params.presetKey, params.requesterUserId, safePageIndex + 1, params.limit))
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(safePageIndex >= pageCount - 1),
      ),
    );
  }

  return {
    content,
    components,
  };
};

const handlePresetHistoryCommand = async (interaction: ChatInputCommandInteraction) => {
  const allowed = await ensurePresetAdminInteraction(interaction);
  if (!allowed) {
    return;
  }

  const presetKey = interaction.options.getString('preset_key', true).trim();
  const limit = interaction.options.getInteger('limit') ?? 10;

  if (!isResearchPresetKey(presetKey)) {
    await interaction.reply({ content: '알 수 없는 preset_key 입니다.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const { data, error } = await supabase
    .from('research_preset_audit')
    .select('id,source,actor_username,created_at,metadata')
    .eq('preset_key', presetKey)
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(20, limit)));

  if (error) {
    await interaction.editReply(`이력 조회 실패: ${error.message}`);
    return;
  }

  const rows = Array.isArray(data) ? data : [];
  if (!rows.length) {
    await interaction.editReply(appendStudioPresetLink(`preset=${presetKey} 이력 데이터가 없습니다.`, presetKey));
    return;
  }

  const replyPayload = buildPresetHistoryReply({
    presetKey,
    rows,
    requesterUserId: interaction.user.id,
    pageIndex: 0,
    limit: Math.max(1, Math.min(20, limit)),
  });

  await interaction.editReply(replyPayload);
};

const executePresetRestore = async (params: {
  presetKey: string;
  historyId: string;
  actorUserId: string;
  actorUsername: string;
  via: 'discord_slash' | 'discord_button';
}) => {
  const lockKey = `restore:${params.actorUserId}:${params.presetKey}:${params.historyId}`;
  const remainingSec = acquirePresetMutationLock(lockKey);
  if (remainingSec > 0) {
    return {
      ok: false,
      message: `중복 복원 요청이 감지되어 ${remainingSec}초 뒤 다시 시도해 주세요.`,
    };
  }

  try {
    const { data: historyRow, error: historyError } = await supabase
      .from('research_preset_audit')
      .select('id,preset_key,payload')
      .eq('preset_key', params.presetKey)
      .eq('id', params.historyId)
      .maybeSingle<{ id: string; preset_key: string; payload: unknown }>();

    if (historyError) {
      return {
        ok: false,
        message: `복원 대상 조회 실패: ${historyError.message}`,
      };
    }

    if (!historyRow || typeof historyRow.payload !== 'object' || historyRow.payload === null) {
      return {
        ok: false,
        message: '복원 대상 이력 payload를 찾을 수 없습니다.',
      };
    }

    const normalizedPayload = {
      ...(historyRow.payload as Record<string, unknown>),
      key: params.presetKey,
    };

    if (!isResolvedResearchPreset(normalizedPayload)) {
      return {
        ok: false,
        message: '복원 대상 payload 형태가 유효하지 않습니다.',
      };
    }

    const { error: upsertError } = await supabase
      .from('research_presets')
      .upsert(
        [
          {
            preset_key: params.presetKey,
            payload: normalizedPayload,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'preset_key' },
      );

    if (upsertError) {
      return {
        ok: false,
        message: `복원 업서트 실패: ${upsertError.message}`,
      };
    }

    await appendPresetAudit({
      presetKey: params.presetKey,
      actorUserId: params.actorUserId,
      actorUsername: params.actorUsername,
      source: 'restore',
      payload: normalizedPayload,
      metadata: {
        action: 'restore',
        restoredFromHistoryId: params.historyId,
        via: params.via,
      },
    });

    await appendPresetBenchmarkEvent({
      userId: params.actorUserId,
      name: params.via === 'discord_button' ? 'research_preset_restore_discord_button' : 'research_preset_restore_discord',
      payload: {
        presetKey: params.presetKey,
        historyId: params.historyId,
        actor: params.actorUsername,
      },
    });

    return {
      ok: true,
      message: appendStudioPresetLink(
        `복원 완료: preset=${params.presetKey}, history=${params.historyId}`,
        params.presetKey,
        params.historyId,
      ),
    };
  } finally {
    releasePresetMutationLock(lockKey);
  }
};

const handlePresetRestoreCommand = async (interaction: ChatInputCommandInteraction) => {
  const allowed = await ensurePresetAdminInteraction(interaction);
  if (!allowed) {
    return;
  }

  const presetKey = interaction.options.getString('preset_key', true).trim();
  const historyId = interaction.options.getString('history_id', true).trim();

  if (!isResearchPresetKey(presetKey)) {
    await interaction.reply({ content: '알 수 없는 preset_key 입니다.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const result = await executePresetRestore({
    presetKey,
    historyId,
    actorUserId: interaction.user.id,
    actorUsername: interaction.user.username,
    via: 'discord_slash',
  });

  await interaction.editReply(result.message);
};

const handlePresetRestoreButton = async (interaction: ButtonInteraction) => {
  const parsed = parsePresetRestoreButtonCustomId(interaction.customId);
  if (!parsed) {
    return;
  }

  if (!isSupabaseConfigured || !presetAdminUserIds.size) {
    await interaction.reply({
      content: '운영 설정이 준비되지 않아 버튼 복원을 실행할 수 없습니다.',
      ephemeral: true,
    });
    return;
  }

  if (parsed.requesterUserId !== interaction.user.id) {
    await interaction.reply({
      content: '이 버튼은 명령 실행자만 사용할 수 있습니다.',
      ephemeral: true,
    });
    return;
  }

  if (!isPresetAdmin(interaction.user.id)) {
    await interaction.reply({
      content: '관리자 권한이 없어 이 버튼을 실행할 수 없습니다.',
      ephemeral: true,
    });
    return;
  }

  if (!isResearchPresetKey(parsed.presetKey)) {
    await interaction.reply({
      content: '알 수 없는 preset_key 입니다.',
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const result = await executePresetRestore({
    presetKey: parsed.presetKey,
    historyId: parsed.historyId,
    actorUserId: interaction.user.id,
    actorUsername: interaction.user.username,
    via: 'discord_button',
  });

  await interaction.editReply({
    content: result.message,
    components: [],
  });
};

const handlePresetHistoryPageButton = async (interaction: ButtonInteraction) => {
  const parsed = parsePresetHistoryPageButtonCustomId(interaction.customId);
  if (!parsed) {
    return;
  }

  if (!isSupabaseConfigured || !presetAdminUserIds.size) {
    await interaction.reply({
      content: '운영 설정이 준비되지 않아 이력 페이지 이동을 실행할 수 없습니다.',
      ephemeral: true,
    });
    return;
  }

  if (parsed.requesterUserId !== interaction.user.id) {
    await interaction.reply({
      content: '이 버튼은 명령 실행자만 사용할 수 있습니다.',
      ephemeral: true,
    });
    return;
  }

  if (!isPresetAdmin(interaction.user.id)) {
    await interaction.reply({
      content: '관리자 권한이 없어 이 버튼을 실행할 수 없습니다.',
      ephemeral: true,
    });
    return;
  }

  if (!isResearchPresetKey(parsed.presetKey)) {
    await interaction.reply({
      content: '알 수 없는 preset_key 입니다.',
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const normalizedLimit = Math.max(1, Math.min(20, parsed.limit));
  const { data, error } = await supabase
    .from('research_preset_audit')
    .select('id,source,actor_username,created_at,metadata')
    .eq('preset_key', parsed.presetKey)
    .order('created_at', { ascending: false })
    .limit(normalizedLimit);

  if (error) {
    await interaction.editReply({
      content: `이력 조회 실패: ${error.message}`,
      components: [],
    });
    return;
  }

  const rows = Array.isArray(data) ? data : [];
  if (!rows.length) {
    await interaction.editReply({
      content: appendStudioPresetLink(`preset=${parsed.presetKey} 이력 데이터가 없습니다.`, parsed.presetKey),
      components: [],
    });
    return;
  }

  const replyPayload = buildPresetHistoryReply({
    presetKey: parsed.presetKey,
    rows,
    requesterUserId: interaction.user.id,
    pageIndex: parsed.pageIndex,
    limit: normalizedLimit,
  });

  await interaction.editReply(replyPayload);
};

const handlePresetUpsertCommand = async (interaction: ChatInputCommandInteraction) => {
  const allowed = await ensurePresetAdminInteraction(interaction);
  if (!allowed) {
    return;
  }

  const presetKey = interaction.options.getString('preset_key', true).trim();
  const payloadJson = interaction.options.getString('payload_json', true);

  if (!isResearchPresetKey(presetKey)) {
    await interaction.reply({ content: '알 수 없는 preset_key 입니다.', ephemeral: true });
    return;
  }

  const lockKey = `upsert:${interaction.user.id}:${presetKey}`;
  const remainingSec = acquirePresetMutationLock(lockKey);
  if (remainingSec > 0) {
    await interaction.reply({
      content: `중복 업서트 요청이 감지되어 ${remainingSec}초 뒤 다시 시도해 주세요.`,
      ephemeral: true,
    });
    return;
  }

  try {
    await interaction.deferReply({ ephemeral: true });

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payloadJson);
    } catch {
      await interaction.editReply('payload_json 파싱에 실패했습니다. 유효한 JSON 문자열을 입력하세요.');
      return;
    }

    const normalizedPayload = {
      ...(parsedPayload as Record<string, unknown>),
      key: presetKey,
    };

    if (!isResolvedResearchPreset(normalizedPayload)) {
      await interaction.editReply('payload_json 형태가 유효하지 않습니다. Resolved preset 스키마를 확인하세요.');
      return;
    }

    const { error: upsertError } = await supabase
      .from('research_presets')
      .upsert(
        [
          {
            preset_key: presetKey,
            payload: normalizedPayload,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'preset_key' },
      );

    if (upsertError) {
      await interaction.editReply(`업서트 실패: ${upsertError.message}`);
      return;
    }

    await appendPresetAudit({
      presetKey,
      actorUserId: interaction.user.id,
      actorUsername: interaction.user.username,
      source: 'upsert',
      payload: normalizedPayload,
      metadata: {
        action: 'upsert',
        via: 'discord_slash',
      },
    });

    await appendPresetBenchmarkEvent({
      userId: interaction.user.id,
      name: 'research_preset_upsert_discord',
      payload: {
        presetKey,
        actor: interaction.user.username,
      },
    });

    await interaction.editReply(appendStudioPresetLink(`업서트 완료: preset=${presetKey}`, presetKey));
  } finally {
    releasePresetMutationLock(lockKey);
  }
};

const handlePresetUpsertFromHistoryCommand = async (interaction: ChatInputCommandInteraction) => {
  const allowed = await ensurePresetAdminInteraction(interaction);
  if (!allowed) {
    return;
  }

  const sourcePresetKey = interaction.options.getString('source_preset_key', true).trim();
  const targetPresetKey = interaction.options.getString('target_preset_key', true).trim();
  const historyId = interaction.options.getString('history_id', true).trim();

  if (!isResearchPresetKey(sourcePresetKey) || !isResearchPresetKey(targetPresetKey)) {
    await interaction.reply({ content: '알 수 없는 preset_key 입니다.', ephemeral: true });
    return;
  }

  const lockKey = `upsert-history:${interaction.user.id}:${sourcePresetKey}:${historyId}:${targetPresetKey}`;
  const remainingSec = acquirePresetMutationLock(lockKey);
  if (remainingSec > 0) {
    await interaction.reply({
      content: `중복 이력 업서트 요청이 감지되어 ${remainingSec}초 뒤 다시 시도해 주세요.`,
      ephemeral: true,
    });
    return;
  }

  try {
    await interaction.deferReply({ ephemeral: true });

    const { data: historyRow, error: historyError } = await supabase
      .from('research_preset_audit')
      .select('id,preset_key,payload')
      .eq('preset_key', sourcePresetKey)
      .eq('id', historyId)
      .maybeSingle<{ id: string; preset_key: string; payload: unknown }>();

    if (historyError) {
      await interaction.editReply(`원본 이력 조회 실패: ${historyError.message}`);
      return;
    }

    if (!historyRow || typeof historyRow.payload !== 'object' || historyRow.payload === null) {
      await interaction.editReply('원본 이력 payload를 찾을 수 없습니다.');
      return;
    }

    const normalizedPayload = {
      ...(historyRow.payload as Record<string, unknown>),
      key: targetPresetKey,
    };

    if (!isResolvedResearchPreset(normalizedPayload)) {
      await interaction.editReply('원본 이력 payload 형태가 유효하지 않습니다.');
      return;
    }

    const { error: upsertError } = await supabase
      .from('research_presets')
      .upsert(
        [
          {
            preset_key: targetPresetKey,
            payload: normalizedPayload,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'preset_key' },
      );

    if (upsertError) {
      await interaction.editReply(`업서트 실패: ${upsertError.message}`);
      return;
    }

    await appendPresetAudit({
      presetKey: targetPresetKey,
      actorUserId: interaction.user.id,
      actorUsername: interaction.user.username,
      source: 'upsert',
      payload: normalizedPayload,
      metadata: {
        action: 'upsert',
        via: 'discord_slash',
        sourcePresetKey,
        sourceHistoryId: historyId,
      },
    });

    await appendPresetBenchmarkEvent({
      userId: interaction.user.id,
      name: 'research_preset_upsert_from_history_discord',
      payload: {
        sourcePresetKey,
        targetPresetKey,
        historyId,
        actor: interaction.user.username,
      },
    });

    await interaction.editReply(
      appendStudioPresetLink(
        `이력 업서트 완료: ${sourcePresetKey}/${historyId} → ${targetPresetKey}`,
        targetPresetKey,
        historyId,
      ),
    );
  } finally {
    releasePresetMutationLock(lockKey);
  }
};

client.on('interactionCreate', async (interaction: Interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'preset-history') {
        await handlePresetHistoryCommand(interaction);
        return;
      }

      if (interaction.commandName === 'preset-restore') {
        await handlePresetRestoreCommand(interaction);
        return;
      }

      if (interaction.commandName === 'preset-upsert') {
        await handlePresetUpsertCommand(interaction);
        return;
      }

      if (interaction.commandName === 'preset-upsert-from-history') {
        await handlePresetUpsertFromHistoryCommand(interaction);
        return;
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId.startsWith(`${PRESET_RESTORE_BUTTON_PREFIX}|`)) {
        await handlePresetRestoreButton(interaction);
        return;
      }

      if (interaction.customId.startsWith(`${PRESET_HISTORY_PAGE_BUTTON_PREFIX}|`)) {
        await handlePresetHistoryPageButton(interaction);
        return;
      }

      return;
    }
  } catch (error) {
    console.error('[Discord Bot] Slash command handling failed:', error);
    if (!interaction.isRepliable()) {
      return;
    }

    const alreadyDeferred = 'deferred' in interaction && Boolean(interaction.deferred);
    const alreadyReplied = 'replied' in interaction && Boolean(interaction.replied);

    if (alreadyDeferred || alreadyReplied) {
      await interaction.editReply('명령 처리 중 오류가 발생했습니다.').catch(() => undefined);
      return;
    }

    await interaction.reply({
      content: '명령 처리 중 오류가 발생했습니다.',
      ephemeral: true,
    }).catch(() => undefined);
  }
});

client.on('clientReady', () => {
  botRuntimeStatus.started = true;
  botRuntimeStatus.ready = true;
  botRuntimeStatus.lastReadyAt = new Date().toISOString();
  botRuntimeStatus.lastLoginError = null;
  updateBotRuntimeWsStatus();
  console.log(`[RENDER_EVENT] BOT_READY tag=${client.user?.tag || 'unknown'}`);
  console.log(`✅ [SUCCESS] Logged in as ${client.user?.tag}`);
  logEvent('Bot started successfully', 'info');

  void registerPresetCommands().catch((error) => {
    console.error('[Discord Bot] Failed to register slash commands:', error);
    logEvent(`Slash command register failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
  });
});

client.on('error', (error) => {
  botRuntimeStatus.ready = false;
  botRuntimeStatus.lastLoginErrorAt = new Date().toISOString();
  botRuntimeStatus.lastLoginError = error.message;
  updateBotRuntimeWsStatus();
  console.error('[DISCORD_ERROR]', error);
  console.error('[Discord Bot] Error:', error);
  logEvent(`Bot error: ${error.message}`, 'error');
  scheduleBotReconnect('client_error');
});

client.on('warn', (message) => {
  console.warn(`[DISCORD WARN] ${message}`);
  console.log(`[RENDER_EVENT] BOT_WARN ${message}`);
});

client.on('debug', (info) => {
  console.log(`[DISCORD DEBUG] ${info}`);
});

client.rest.on('rateLimited', (info) => {
  console.log(`[RENDER_EVENT] BOT_REST_RATE_LIMIT route=${info.route} retryAfter=${info.retryAfter} limit=${info.limit}`);
});

client.on('shardError', (error, shardId) => {
  botRuntimeStatus.ready = false;
  botRuntimeStatus.lastLoginErrorAt = new Date().toISOString();
  botRuntimeStatus.lastLoginError = error instanceof Error ? error.message : String(error);
  updateBotRuntimeWsStatus();
  const errCode = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code ?? 'unknown') : 'unknown';
  console.log(`[RENDER_EVENT] BOT_SHARD_ERROR shard=${shardId} code=${errCode}`);
  console.error('[DISCORD_SHARD_ERROR]', error);
  scheduleBotReconnect('shard_error');
});

client.on('shardDisconnect', (event, shardId) => {
  botRuntimeStatus.ready = false;
  botRuntimeStatus.lastDisconnectAt = new Date().toISOString();
  botRuntimeStatus.lastDisconnectCode = event.code;
  botRuntimeStatus.lastDisconnectReason = event.reason || 'unknown';
  updateBotRuntimeWsStatus();
  console.log(`[RENDER_EVENT] BOT_SHARD_DISCONNECT shard=${shardId} code=${event.code} reason=${event.reason || 'unknown'}`);
  if (event.code === 4014) {
    console.log('[RENDER_EVENT] BOT_INTENTS_DISALLOWED_HINT check Discord Portal privileged intents (Message Content / Presence Intent)');
  }
  scheduleBotReconnect(`shard_disconnect_${event.code}`);
});

client.on('shardReconnecting', (shardId) => {
  console.log(`[RENDER_EVENT] BOT_SHARD_RECONNECTING shard=${shardId}`);
});

client.on('shardResume', (shardId) => {
  botRuntimeStatus.ready = client.isReady();
  updateBotRuntimeWsStatus();
  console.log(`[RENDER_EVENT] BOT_SHARD_RESUME shard=${shardId}`);
});

client.on('invalidated', () => {
  botRuntimeStatus.ready = false;
  botRuntimeStatus.lastInvalidatedAt = new Date().toISOString();
  updateBotRuntimeWsStatus();
  console.log('[RENDER_EVENT] BOT_SESSION_INVALIDATED');
  scheduleBotReconnect('session_invalidated', Math.max(5000, reconnectDelayMs));
});

// Helper to log events to DB
export async function logEvent(message: string, type: 'info' | 'error' | 'success', user_id?: string) {
  try {
    await supabase.from('logs').insert([{ message, type, user_id }]);
  } catch (err) {
    console.error('Failed to write log to DB:', err);
  }
}

// Function to trigger a new forum post
export async function createForumThread(forumChannelId: string, title: string, content: string, imageBase64?: string, user_id?: string) {
  if (!client.isReady()) {
    throw new Error('Discord bot is not ready or not configured.');
  }

  try {
    const channel = await client.channels.fetch(forumChannelId);

    if (!channel) {
      throw new Error('Channel not found.');
    }

    if (channel.type !== ChannelType.GuildForum && channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
      throw new Error('Target channel is not a Forum or Text Channel.');
    }

    const messageOptions: any = { content: content };
    
    // If an image was pasted, convert base64 to a buffer and attach it
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const attachment = new AttachmentBuilder(buffer, { name: 'uploaded_image.png' });
      messageOptions.files = [attachment];
    }

    let thread;
    if (channel.type === ChannelType.GuildForum) {
      const forumChannel = channel as ForumChannel;
      // Create a thread in the forum channel
      thread = await forumChannel.threads.create({
        name: title.substring(0, 100), // Discord thread names are limited to 100 chars
        message: messageOptions,
      });
    } else {
      const textChannel = channel as TextChannel;
      // Create a thread in the text channel
      thread = await textChannel.threads.create({
        name: title.substring(0, 100),
      });
      // Send the message to the newly created thread
      await thread.send(messageOptions);
    }

    logEvent(`Created new thread: ${title}`, 'success', user_id);
    return thread;
  } catch (error: any) {
    console.error('[Discord Bot] Error creating thread:', error);
    logEvent(`Failed to create thread: ${error.message}`, 'error', user_id);
    throw error;
  }
}

// Start the bot if token is available
export function startBot(token: string) {
  botRuntimeStatus.started = true;
  botRuntimeStatus.tokenPresent = Boolean(token);
  updateBotRuntimeWsStatus();
  if (!token) {
    botRuntimeStatus.ready = false;
    botRuntimeStatus.lastLoginErrorAt = new Date().toISOString();
    botRuntimeStatus.lastLoginError = 'missing_token';
    console.log('[RENDER_EVENT] BOT_START_SKIPPED reason=missing_token');
    console.log('[Discord Bot] No token provided, bot will not start.');
    return;
  }

  const normalizedToken = token.trim().replace(/^['\"]|['\"]$/g, '');
  activeBotToken = normalizedToken;
  const tokenLooksJwtLike = normalizedToken.split('.').length === 3;
  if (normalizedToken.length !== token.length) {
    console.log('[RENDER_EVENT] BOT_TOKEN_NORMALIZED trimmed_or_unquoted=true');
  }
  console.log(`[RENDER_EVENT] BOT_TOKEN_FORMAT jwt_like=${tokenLooksJwtLike}`);

  const messageContentEnv = process.env.DISCORD_ENABLE_MESSAGE_CONTENT;
  const guildPresencesEnv = process.env.DISCORD_ENABLE_GUILD_PRESENCES;
  const nodeOptions = process.env.NODE_OPTIONS;
  console.log(`[RENDER_EVENT] BOT_INTENTS envMessageContent=${messageContentEnv ?? 'undefined'} envGuildPresences=${guildPresencesEnv ?? 'undefined'} effectiveMessageContent=true effectiveGuildPresences=true`);
  console.log(`[RENDER_EVENT] BOT_RUNTIME node=${process.version} platform=${process.platform} nodeOptions=${nodeOptions ?? 'undefined'}`);

  const logDnsResolution = (host: string) => {
    lookup(host, { all: true }, (err, addresses) => {
      if (err) {
        const errCode = typeof err === 'object' && err && 'code' in err ? String((err as { code?: unknown }).code ?? 'unknown') : 'unknown';
        console.log(`[RENDER_EVENT] DNS_LOOKUP_FAILED host=${host} code=${errCode}`);
        console.error(`[DNS] lookup failed host=${host}:`, err);
        return;
      }

      const joined = (addresses || []).map((item) => `${item.address}/v${item.family}`).join(',');
      console.log(`[RENDER_EVENT] DNS_LOOKUP_OK host=${host} addresses=${joined || 'none'}`);
    });
  };

  logDnsResolution('gateway.discord.gg');
  logDnsResolution('discord.com');

  const runHttpPreflight = async () => {
    console.log('[RENDER_EVENT] BOT_HTTP_PREFLIGHT_START');

    const runCheck = async (name: string, url: string, headers?: Record<string, string>) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        const body = await response.text();
        const bodyPreview = body.replace(/\s+/g, ' ').slice(0, 200);
        console.log(`[RENDER_EVENT] BOT_HTTP_PREFLIGHT_RESULT name=${name} status=${response.status} ok=${response.ok}`);

        if (!response.ok) {
          console.log(`[RENDER_EVENT] BOT_HTTP_PREFLIGHT_BODY name=${name} preview=${bodyPreview || 'empty'}`);
        }
      } catch (err: unknown) {
        const errName = err instanceof Error ? err.name : typeof err;
        const errMessage = err instanceof Error ? err.message : String(err);
        console.log(`[RENDER_EVENT] BOT_HTTP_PREFLIGHT_FAILED name=${name} error=${errName}`);
        console.error(`[Discord Bot] HTTP preflight failed for ${name}:`, errMessage);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    await runCheck('gateway', 'https://discord.com/api/v10/gateway');
    await runCheck('gateway_bot', 'https://discord.com/api/v10/gateway/bot', {
      Authorization: `Bot ${normalizedToken}`,
    });

    console.log('[RENDER_EVENT] BOT_HTTP_PREFLIGHT_DONE');
  };

  let hasRetried = false;
  let attempt = 0;

  const runLoginAttempt = () => {
    attempt += 1;
    botRuntimeStatus.lastLoginAttemptAt = new Date().toISOString();
    botRuntimeStatus.ready = false;
    updateBotRuntimeWsStatus();
    const startedAt = Date.now();
    console.log(`[RENDER_EVENT] BOT_LOGIN_ATTEMPT n=${attempt}`);

    const progressInterval = setInterval(() => {
      if (client.isReady()) {
        clearInterval(progressInterval);
        return;
      }
      console.log(`[RENDER_EVENT] BOT_LOGIN_PROGRESS wsStatus=${client.ws.status} elapsedMs=${Date.now() - startedAt}`);
    }, 10000);

    const timeout = setTimeout(() => {
      if (client.isReady()) {
        clearInterval(progressInterval);
        return;
      }

      clearInterval(progressInterval);
      console.log(`[RENDER_EVENT] BOT_LOGIN_TIMEOUT ms=${loginTimeoutMs} attempt=${attempt}`);
      console.error('[Discord Bot] Login timed out before ready event.');

      if (!hasRetried) {
        hasRetried = true;
        console.log('[RENDER_EVENT] BOT_LOGIN_RETRY reason=timeout delayMs=5000');
        try {
          client.destroy();
        } catch (destroyErr) {
          console.error('[Discord Bot] Failed to destroy client before retry:', destroyErr);
        }
        setTimeout(runLoginAttempt, 5000);
      }
    }, loginTimeoutMs);

    client
      .login(normalizedToken)
      .then(() => {
        clearTimeout(timeout);
        clearInterval(progressInterval);
        botRuntimeStatus.ready = client.isReady();
        botRuntimeStatus.lastLoginError = null;
        updateBotRuntimeWsStatus();
        console.log(`[RENDER_EVENT] BOT_LOGIN_PROMISE_RESOLVED attempt=${attempt}`);
      })
      .catch((err) => {
        clearTimeout(timeout);
        clearInterval(progressInterval);

        const errCode = typeof err === 'object' && err && 'code' in err ? String((err as { code?: unknown }).code ?? 'unknown') : 'unknown';
        const errMessage = err instanceof Error ? err.message : String(err);
        botRuntimeStatus.lastLoginErrorAt = new Date().toISOString();
        botRuntimeStatus.lastLoginError = `[${errCode}] ${errMessage}`;
        botRuntimeStatus.ready = false;
        updateBotRuntimeWsStatus();
        console.log(`[RENDER_EVENT] BOT_LOGIN_FAILED code=${errCode} attempt=${attempt}`);
        console.error('[Discord Bot] Failed to login:', err);
        logEvent(`Login failed: [${errCode}] ${errMessage}`, 'error');

        if (!hasRetried) {
          hasRetried = true;
          console.log('[RENDER_EVENT] BOT_LOGIN_RETRY reason=login_failed delayMs=5000');
          setTimeout(runLoginAttempt, 5000);
        }
      });

    client.once('clientReady', () => {
      clearTimeout(timeout);
      clearInterval(progressInterval);
    });
  };

  runHttpPreflight()
    .catch((err) => {
      console.error('[Discord Bot] Unexpected preflight error:', err);
      botRuntimeStatus.lastLoginErrorAt = new Date().toISOString();
      botRuntimeStatus.lastLoginError = err instanceof Error ? err.message : String(err);
      updateBotRuntimeWsStatus();
    })
    .finally(() => {
      runLoginAttempt();
    });
}
