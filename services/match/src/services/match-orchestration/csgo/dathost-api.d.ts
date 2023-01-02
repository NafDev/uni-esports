import type { MatchService } from '@uni-esports/interfaces';

type GameServer = {
	added_voice_server: string;
	ark_settings: {
		cluster_main_server: string;
	};
	autostop: boolean;
	autostop_minutes: number;
	booting: boolean;
	confirmed: boolean;
	cost_per_hour: number;
	csgo_settings: {
		autoload_configs: string[];
		disable_1v1_warmup_arenas: boolean;
		disable_bots: boolean;
		enable_csay_plugin: boolean;
		enable_gotv: boolean;
		enable_gotv_secondary: boolean;
		enable_sourcemod: boolean;
		game_mode: string;
		insecure: boolean;
		mapgroup: string;
		mapgroup_start_map: string;
		maps_source: string;
		password: string;
		private_server: boolean;
		pure_server: boolean;
		rcon: string;
		slots: number;
		sourcemod_admins: string;
		sourcemod_plugins: string[];
		steam_game_server_login_token: string;
		tickrate: number;
		workshop_authkey: string;
		workshop_id: string;
		workshop_start_map_id: string;
	};
	custom_domain: string;
	cycle_months_12_discount_percentage: number;
	cycle_months_1_discount_percentage: number;
	cycle_months_3_discount_percentage: number;
	default_file_locations: string[];
	deletion_protection: boolean;
	disk_usage_bytes: number;
	duplicate_source_server: string;
	enable_core_dump: boolean;
	enable_mysql: boolean;
	enable_syntropy: boolean;
	first_month_discount_percentage: number;
	ftp_password: string;
	game: string;
	id: string;
	ip: string;
	location: string;
	manual_sort_order: number;
	match_id: string;
	max_cost_per_hour: number;
	max_cost_per_month: number;
	max_disk_usage_gb: number;
	month_credits: number;
	month_reset_at: number;
	mumble_settings: {
		password: string;
		slots: number;
		superuser_password: string;
		welcome_text: string;
	};
	mysql_password: string;
	mysql_username: string;
	name: string;
	on: boolean;
	players_online: number;
	ports: {
		'*': {
			additionalProp1: number;
			additionalProp2: number;
			additionalProp3: number;
		};
		game: number;
		gotv: number;
		gotv_secondary: number;
		query: number;
	};
	prefer_dedicated: boolean;
	private_ip: string;
	raw_ip: string;
	reboot_on_crash: boolean;
	scheduled_commands: [
		{
			action: string;
			command: string;
			name: string;
			repeat: number;
			run_at: number;
		}
	];
	server_error: string;
	server_image: string;
	status: [
		{
			key: string;
			value: string;
		}
	];
	subscription_cycle_months: number;
	subscription_renewal_failed_attempts: number;
	subscription_renewal_next_attempt_at: number;
	subscription_state: 'PAY_AS_YOU_GO';
	teamfortress2_settings: {
		enable_gotv: boolean;
		enable_sourcemod: boolean;
		insecure: boolean;
		password: string;
		rcon: string;
		slots: number;
		sourcemod_admins: string;
		start_map: string;
	};
	teamspeak3_settings: {
		slots: number;
		ts_admin_token: string;
		ts_server_id: string;
	};
	user_data: string;
	valheim_settings: {
		admins_steamid64: string[];
		bepinex_plugins: string[];
		enable_bepinex: boolean;
		enable_crossplay: boolean;
		enable_valheimplus: boolean;
		password: string;
		server_branch: string;
		slots: number;
		world_name: string;
	};
};

type MatchServerStart = {
	cancel_reason: string;
	connect_time: number;
	enable_knife_round: boolean;
	enable_pause: boolean;
	enable_playwin: boolean;
	enable_ready: boolean;
	enable_tech_pause: boolean;
	finished: boolean;
	game_server_id: string;
	id: string;
	map: string;
	match_end_webhook_url: string;
	match_series_id: string;
	message_prefix: string;
	player_stats: [
		{
			assists: number;
			deaths: number;
			kills: number;
			steam_id: string;
		}
	];
	playwin_result: Record<string, unknown>;
	playwin_result_webhook_url: string;
	ready_min_players: number;
	round_end_webhook_url: string;
	rounds_played: number;
	spectator_steam_ids: string[];
	started: boolean;
	team1_coach_steam_id: string;
	team1_flag: string;
	team1_name: string;
	team1_start_ct: boolean;
	team1_stats: {
		score: number;
	};
	team1_steam_ids: string[];
	team2_coach_steam_id: string;
	team2_flag: string;
	team2_name: string;
	team2_stats: {
		score: number;
	};
	team2_steam_ids: string[];
	team_size: number;
	wait_for_coaches: boolean;
	wait_for_gotv_before_nextmap: boolean;
	wait_for_spectators: boolean;
	warmup_time: number;
};

type MatchRoundInfo = MatchService['match.event.csgo.round'] & {
	roundData: MatchServerStart;
};

type MatchEndInfo = MatchService['match.event.csgo.match'] & {
	matchData: MatchServerStart;
};
