-- =====================================================
-- Nooodle Mobile - Supabase Database Schema
-- =====================================================
-- このファイルをSupabase SQL Editorで実行してください
-- =====================================================

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- フォローリクエストステータス
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

-- 通知タイプ
CREATE TYPE notification_type AS ENUM (
  'follow',
  'follow_request',
  'follow_request_approved',
  'like',
  'comment',
  'comment_like',
  'message',
  'admin_announcement',
  'rank_up',
  'badge_earned'
);

-- 都道府県バッジティア
CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold');

-- フィードバックカテゴリ
CREATE TYPE feedback_category AS ENUM ('feature', 'bug', 'improvement', 'other');

-- フィードバックステータス
CREATE TYPE feedback_status AS ENUM ('new', 'in_progress', 'resolved', 'rejected');

-- =====================================================
-- TABLES
-- =====================================================

-- ----------------------------------------------------
-- users テーブル
-- ----------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  custom_avatar_url TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  selected_theme_level INTEGER DEFAULT 1,
  is_admin BOOLEAN DEFAULT FALSE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  last_timeline_visit TIMESTAMPTZ,
  push_token TEXT, -- Expo Push Token
  CONSTRAINT unique_auth_id UNIQUE (auth_id)
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE users IS 'ユーザー情報';
COMMENT ON COLUMN users.auth_id IS 'Supabase Auth UID';
COMMENT ON COLUMN users.selected_theme_level IS '選択したテーマカラーのランクレベル';
COMMENT ON COLUMN users.is_admin IS '管理者フラグ';
COMMENT ON COLUMN users.onboarding_complete IS '初回セットアップ完了フラグ';
COMMENT ON COLUMN users.is_private IS '鍵アカウントフラグ';
COMMENT ON COLUMN users.push_token IS 'Expoプッシュ通知トークン';

-- ----------------------------------------------------
-- shops テーブル
-- ----------------------------------------------------
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  url TEXT,
  prefecture TEXT,
  station TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shops_name ON shops(name);
CREATE INDEX idx_shops_prefecture ON shops(prefecture);
CREATE INDEX idx_shops_station ON shops(station);

COMMENT ON TABLE shops IS '店舗情報';
COMMENT ON COLUMN shops.prefecture IS '都道府県コード（tokyo, osakaなど）';

-- ----------------------------------------------------
-- noodles テーブル
-- ----------------------------------------------------
CREATE TABLE noodles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  ramen_name TEXT NOT NULL,
  genres TEXT[] NOT NULL DEFAULT '{}',
  visit_date TIMESTAMPTZ,
  comment TEXT,
  evaluation INTEGER CHECK (evaluation >= 1 AND evaluation <= 5),
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_noodles_user_id ON noodles(user_id);
CREATE INDEX idx_noodles_shop_id ON noodles(shop_id);
CREATE INDEX idx_noodles_evaluation ON noodles(evaluation);
CREATE INDEX idx_noodles_visit_date ON noodles(visit_date DESC);
CREATE INDEX idx_noodles_created_at ON noodles(created_at DESC);

COMMENT ON TABLE noodles IS 'ラーメン投稿';
COMMENT ON COLUMN noodles.genres IS 'ジャンル（配列）：醤油、塩、味噌など';
COMMENT ON COLUMN noodles.evaluation IS '評価（1-5）';
COMMENT ON COLUMN noodles.image_urls IS '画像URL配列（Supabase Storage）';

-- ----------------------------------------------------
-- likes テーブル
-- ----------------------------------------------------
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  noodle_id UUID REFERENCES noodles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_noodle_like UNIQUE (user_id, noodle_id)
);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_noodle_id ON likes(noodle_id);

COMMENT ON TABLE likes IS '投稿へのいいね';

-- ----------------------------------------------------
-- follows テーブル
-- ----------------------------------------------------
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

COMMENT ON TABLE follows IS 'フォロー関係';
COMMENT ON COLUMN follows.follower_id IS 'フォローする人';
COMMENT ON COLUMN follows.following_id IS 'フォローされる人';

-- ----------------------------------------------------
-- follow_requests テーブル
-- ----------------------------------------------------
CREATE TABLE follow_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_follow_request UNIQUE (requester_id, target_id),
  CONSTRAINT no_self_request CHECK (requester_id != target_id)
);

CREATE INDEX idx_follow_requests_requester_id ON follow_requests(requester_id);
CREATE INDEX idx_follow_requests_target_id ON follow_requests(target_id);
CREATE INDEX idx_follow_requests_target_status ON follow_requests(target_id, status);

COMMENT ON TABLE follow_requests IS 'フォローリクエスト（鍵アカウント用）';

-- ----------------------------------------------------
-- comments テーブル
-- ----------------------------------------------------
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  noodle_id UUID REFERENCES noodles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_noodle_id ON comments(noodle_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

COMMENT ON TABLE comments IS '投稿へのコメント';

-- ----------------------------------------------------
-- comment_likes テーブル
-- ----------------------------------------------------
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_comment_like UNIQUE (user_id, comment_id)
);

CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);

COMMENT ON TABLE comment_likes IS 'コメントへのいいね';

-- ----------------------------------------------------
-- chat_rooms テーブル
-- ----------------------------------------------------
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_ids UUID[] NOT NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT two_participants CHECK (array_length(participant_ids, 1) = 2)
);

CREATE INDEX idx_chat_rooms_last_message_at ON chat_rooms(last_message_at DESC);
CREATE INDEX idx_chat_rooms_participants ON chat_rooms USING GIN(participant_ids);

COMMENT ON TABLE chat_rooms IS 'チャットルーム（1対1）';

-- ----------------------------------------------------
-- chat_messages テーブル
-- ----------------------------------------------------
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);

COMMENT ON TABLE chat_messages IS 'チャットメッセージ';

-- ----------------------------------------------------
-- notifications テーブル
-- ----------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID,
  title TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS '通知';

-- ----------------------------------------------------
-- my_bests テーブル
-- ----------------------------------------------------
CREATE TABLE my_bests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  noodle_id UUID REFERENCES noodles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_category UNIQUE (user_id, category)
);

CREATE INDEX idx_my_bests_user_id ON my_bests(user_id);

COMMENT ON TABLE my_bests IS 'マイベストラーメン';
COMMENT ON COLUMN my_bests.category IS 'overall, shoyu, shio, miso など';

-- ----------------------------------------------------
-- user_badges テーブル
-- ----------------------------------------------------
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_code TEXT NOT NULL,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_code)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

COMMENT ON TABLE user_badges IS '獲得バッジ';

-- ----------------------------------------------------
-- prefecture_badges テーブル
-- ----------------------------------------------------
CREATE TABLE prefecture_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  prefecture TEXT NOT NULL,
  tier badge_tier NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_prefecture UNIQUE (user_id, prefecture)
);

CREATE INDEX idx_prefecture_badges_user_id ON prefecture_badges(user_id);

COMMENT ON TABLE prefecture_badges IS '都道府県バッジ';

-- ----------------------------------------------------
-- feedbacks テーブル
-- ----------------------------------------------------
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category feedback_category NOT NULL,
  message TEXT NOT NULL,
  heat_level INTEGER CHECK (heat_level >= 1 AND heat_level <= 3),
  steam_count INTEGER DEFAULT 0,
  status feedback_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);

COMMENT ON TABLE feedbacks IS '改善要望（麺テナンス）';

-- ----------------------------------------------------
-- feedback_steams テーブル
-- ----------------------------------------------------
CREATE TABLE feedback_steams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES feedbacks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  heat_level INTEGER CHECK (heat_level >= 1 AND heat_level <= 3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_feedback_steam UNIQUE (user_id, feedback_id)
);

CREATE INDEX idx_feedback_steams_feedback_id ON feedback_steams(feedback_id);

COMMENT ON TABLE feedback_steams IS 'フィードバックへの共感（湯気ボタン）';

-- ----------------------------------------------------
-- app_settings テーブル
-- ----------------------------------------------------
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_app_settings_key ON app_settings(key);

COMMENT ON TABLE app_settings IS 'アプリ設定';

-- ----------------------------------------------------
-- stations テーブル
-- ----------------------------------------------------
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  prefecture TEXT,
  line TEXT,
  registered_by UUID REFERENCES users(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stations_name ON stations(name);
CREATE INDEX idx_stations_prefecture ON stations(prefecture);

COMMENT ON TABLE stations IS '駅マスタ';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- ----------------------------------------------------
-- updated_at 自動更新トリガー
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_noodles_updated_at
  BEFORE UPDATE ON noodles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_requests_updated_at
  BEFORE UPDATE ON follow_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prefecture_badges_updated_at
  BEFORE UPDATE ON prefecture_badges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------
-- 新規ユーザー作成時のトリガー（auth.users → users）
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------
-- いいね数カウント更新（オプション）
-- ----------------------------------------------------
-- CREATE OR REPLACE FUNCTION update_like_count()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- 必要に応じて集計テーブルを更新
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTIONS（ヘルパー関数）
-- =====================================================

-- ----------------------------------------------------
-- ユーザーの投稿店舗数を取得
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_shop_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(DISTINCT shop_id)::INTEGER
  FROM noodles
  WHERE user_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- ----------------------------------------------------
-- ユーザーの投稿数を取得
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_post_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM noodles
  WHERE user_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- ----------------------------------------------------
-- 投稿のいいね数を取得
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION get_noodle_like_count(noodle_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM likes
  WHERE noodle_id = noodle_uuid;
$$ LANGUAGE SQL STABLE;

-- ----------------------------------------------------
-- ユーザーのフォロワー数を取得
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_follower_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM follows
  WHERE following_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- ----------------------------------------------------
-- ユーザーのフォロー中数を取得
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_following_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM follows
  WHERE follower_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- デフォルトアプリ設定
INSERT INTO app_settings (key, value) VALUES
  ('follow_enabled', 'true'::jsonb),
  ('maintenance_mode', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 完了メッセージ
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Nooodle Database Schema created successfully!';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Run 02_rls_policies.sql to set up Row Level Security';
  RAISE NOTICE '   2. Run 03_seed_data.sql to populate initial data (optional)';
END $$;
