-- PostgreSQL migration blueprint. Not a provisioned database.
-- Public content is read-only; editorial writes must be restricted to server-side roles.
begin;
create table sources (
 id text primary key, title text not null, url text not null check(url like 'https://%'),
 kind text not null check(kind in ('official','community-reference','community-report','test')),
 published_at date, reviewed_at date, game_version text
);
create table champions (
 id text primary key, name text not null, class text not null check(class in ('Cosmic','Tech','Mutant','Skill','Science','Mystic')),
 summary text not null, strengths text, risks text, playstyle text, awakening text,
 signature_target integer, review_state text not null default 'draft',
 updated_at timestamptz not null default now()
);
create table abilities(id text primary key,name text not null);
create table immunities(id text primary key,name text not null);
create table tags(id text primary key,name text not null);
create table relics(id text primary key,name text not null,kind text,description text);
create table game_modes(id text primary key,name text not null);
create table nodes(id text primary key,name text not null,description text);
create table quests(id text primary key,name text not null,description text);
create table bosses(id text primary key,name text not null,quest_id text references quests(id),chapter text,summary text,phases jsonb not null default '[]',mistakes jsonb not null default '[]');
create table champion_abilities(champion_id text references champions(id),ability_id text references abilities(id),source_id text references sources(id),conditions text,primary key(champion_id,ability_id));
create table champion_immunities(champion_id text references champions(id),immunity_id text references immunities(id),source_id text references sources(id),conditional boolean not null default false,conditions text,primary key(champion_id,immunity_id));
create table champion_tags(champion_id text references champions(id),tag_id text references tags(id),editorial boolean not null default false,primary key(champion_id,tag_id));
create table champion_sources(champion_id text references champions(id),source_id text references sources(id),primary key(champion_id,source_id));
create table boss_sources(boss_id text references bosses(id),source_id text references sources(id),primary key(boss_id,source_id));
create table boss_nodes(boss_id text references bosses(id),node_id text references nodes(id),primary key(boss_id,node_id));
create table champion_relics(champion_id text references champions(id),relic_id text references relics(id),source_id text references sources(id),rationale text,primary key(champion_id,relic_id));
create table counters(
 id text primary key,attacker_id text not null references champions(id),
 defender_champion_id text references champions(id),defender_boss_id text references bosses(id),
 why text not null,strategy text not null,risks text not null,
 awakening text,signature_level integer,relic_id text references relics(id),
 score smallint check(score between 1 and 5),score_reason text,
 patch text,season text,reviewed_at date,expires_at date,review_state text not null default 'draft',
 check(num_nonnulls(defender_champion_id,defender_boss_id)=1)
);
create table counter_modes(counter_id text references counters(id),mode_id text references game_modes(id),primary key(counter_id,mode_id));
create table counter_nodes(counter_id text references counters(id),node_id text references nodes(id),interaction text,primary key(counter_id,node_id));
create table counter_abilities(counter_id text references counters(id),ability_id text references abilities(id),primary key(counter_id,ability_id));
create table counter_sources(counter_id text references counters(id),source_id text references sources(id),primary key(counter_id,source_id));
create table synergies(id text primary key,name text not null,effect text not null,source_id text references sources(id));
create table synergy_champions(synergy_id text references synergies(id),champion_id text references champions(id),primary key(synergy_id,champion_id));
create table ratings(id text primary key,champion_id text references champions(id),mode_id text references game_modes(id),dimension text not null,value numeric,scale_max numeric,season text,patch text,methodology text not null,reviewed_at date,source_id text references sources(id));
create table guides(id text primary key,title text not null,slug text unique not null,body jsonb not null,quest_id text references quests(id),boss_id text references bosses(id),champion_id text references champions(id),review_state text not null default 'draft');
create table videos(id text primary key,title text not null,creator text not null,youtube_id text not null,start_seconds integer not null default 0,owner_video boolean not null default false,published_at date);
create table guide_videos(guide_id text references guides(id),video_id text references videos(id),primary key(guide_id,video_id));
create table boss_videos(boss_id text references bosses(id),video_id text references videos(id),primary key(boss_id,video_id));
create table champion_videos(champion_id text references champions(id),video_id text references videos(id),primary key(champion_id,video_id));
create table revisions(id bigint generated always as identity primary key,entity_type text not null,entity_id text not null,editor_id text not null,change jsonb not null,reviewer_id text,created_at timestamptz not null default now());
create index counters_by_champion on counters(defender_champion_id);
create index counters_by_boss on counters(defender_boss_id);
create index champion_names on champions(lower(name));
commit;
-- Before a hosted CMS: add authenticated editor roles, RLS/authorization,
-- audit retention and migration tests. Never grant anonymous write access.
