-- =====================================================
-- Nooodle Mobile - Row Level Security (RLS) Policies
-- =====================================================
-- このファイルを01_schema.sqlの後に実行してください
-- =====================================================

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE noodles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE prefecture_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_steams ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- users テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーが削除されていないユーザーを閲覧可能
CREATE POLICY "Anyone can view non-deleted users" ON users
  FOR SELECT
  USING (deleted_at IS NULL);

-- ユーザーは自分のレコードを更新可能
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- ユーザーは自分のレコードを削除可能（論理削除）
CREATE POLICY "Users can delete their own profile" ON users
  FOR UPDATE
  USING (auth.uid() = auth_id AND deleted_at IS NULL)
  WITH CHECK (deleted_at IS NOT NULL);

-- =====================================================
-- shops テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーが店舗を閲覧可能
CREATE POLICY "Anyone can view shops" ON shops
  FOR SELECT
  USING (true);

-- 認証済みユーザーが店舗を作成可能
CREATE POLICY "Authenticated users can create shops" ON shops
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 誰も店舗を更新・削除できない（必要に応じて管理者のみに変更）
-- CREATE POLICY "Admins can update shops" ON shops
--   FOR UPDATE
--   USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = true));

-- =====================================================
-- noodles テーブルのRLSポリシー
-- =====================================================

-- 公開投稿は全員閲覧可能、鍵アカウントはフォロワーまたは自分のみ
CREATE POLICY "Public noodles are viewable by everyone" ON noodles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = noodles.user_id
      AND users.deleted_at IS NULL
      AND (
        users.is_private = FALSE  -- 公開アカウント
        OR users.auth_id = auth.uid()  -- 自分の投稿
        OR EXISTS (  -- フォロー中
          SELECT 1 FROM follows
          WHERE follows.follower_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
          )
          AND follows.following_id = users.id
        )
      )
    )
  );

-- 認証済みユーザーが投稿を作成可能
CREATE POLICY "Authenticated users can create noodles" ON noodles
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- 投稿者のみ自分の投稿を更新可能
CREATE POLICY "Users can update their own noodles" ON noodles
  FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- 投稿者のみ自分の投稿を削除可能
CREATE POLICY "Users can delete their own noodles" ON noodles
  FOR DELETE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================
-- likes テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーがいいねを閲覧可能
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT
  USING (true);

-- 認証済みユーザーがいいねを作成可能
CREATE POLICY "Authenticated users can create likes" ON likes
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ユーザーは自分のいいねのみ削除可能
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================
-- follows テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーがフォロー関係を閲覧可能
CREATE POLICY "Anyone can view follows" ON follows
  FOR SELECT
  USING (true);

-- 認証済みユーザーがフォローを作成可能
CREATE POLICY "Authenticated users can create follows" ON follows
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ユーザーは自分のフォローのみ削除可能（アンフォロー）
CREATE POLICY "Users can delete their own follows" ON follows
  FOR DELETE
  USING (
    follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================
-- follow_requests テーブルのRLSポリシー
-- =====================================================

-- リクエスト送信者とターゲットのみ閲覧可能
CREATE POLICY "Users can view their follow requests" ON follow_requests
  FOR SELECT
  USING (
    requester_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR target_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- 認証済みユーザーがリクエストを作成可能
CREATE POLICY "Authenticated users can create follow requests" ON follow_requests
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND requester_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ターゲットユーザーのみリクエストを更新可能（承認・拒否）
CREATE POLICY "Target users can update follow requests" ON follow_requests
  FOR UPDATE
  USING (
    target_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    target_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- リクエスト送信者のみ削除可能（キャンセル）
CREATE POLICY "Requester can delete their requests" ON follow_requests
  FOR DELETE
  USING (
    requester_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================
-- comments テーブルのRLSポリシー
-- =====================================================

-- コメントは投稿閲覧権限と同じ
CREATE POLICY "Comments follow noodle visibility" ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM noodles
      WHERE noodles.id = comments.noodle_id
      AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = noodles.user_id
        AND users.deleted_at IS NULL
        AND (
          users.is_private = FALSE
          OR users.auth_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM follows
            WHERE follows.follower_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
            AND follows.following_id = users.id
          )
        )
      )
    )
  );

-- 認証済みユーザーがコメントを作成可能
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- コメント投稿者のみ削除可能
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================
-- comment_likes テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーがコメントいいねを閲覧可能
CREATE POLICY "Anyone can view comment likes" ON comment_likes
  FOR SELECT
  USING (true);

-- 認証済みユーザーがコメントいいねを作成可能
CREATE POLICY "Authenticated users can create comment likes" ON comment_likes
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ユーザーは自分のコメントいいねのみ削除可能
CREATE POLICY "Users can delete their own comment likes" ON comment_likes
  FOR DELETE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================
-- chat_rooms テーブルのRLSポリシー
-- =====================================================

-- 参加者のみチャットルームを閲覧可能
CREATE POLICY "Participants can view their chat rooms" ON chat_rooms
  FOR SELECT
  USING (
    (SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(participant_ids)
  );

-- 認証済みユーザーがチャットルームを作成可能
CREATE POLICY "Authenticated users can create chat rooms" ON chat_rooms
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(participant_ids)
  );

-- 参加者のみチャットルームを更新可能
CREATE POLICY "Participants can update their chat rooms" ON chat_rooms
  FOR UPDATE
  USING (
    (SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(participant_ids)
  )
  WITH CHECK (
    (SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(participant_ids)
  );

-- =====================================================
-- chat_messages テーブルのRLSポリシー
-- =====================================================

-- 参加者のみメッセージを閲覧可能
CREATE POLICY "Participants can view messages" ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(chat_rooms.participant_ids)
    )
  );

-- 参加者のみメッセージを作成可能
CREATE POLICY "Participants can create messages" ON chat_messages
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND sender_id = ANY(chat_rooms.participant_ids)
    )
  );

-- 参加者のみメッセージを更新可能（既読フラグ更新）
CREATE POLICY "Participants can update messages" ON chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(chat_rooms.participant_ids)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(chat_rooms.participant_ids)
    )
  );

-- =====================================================
-- notifications テーブルのRLSポリシー
-- =====================================================

-- ユーザーは自分の通知のみ閲覧可能
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- システムが通知を作成（アプリケーション側から）
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);

-- ユーザーは自分の通知のみ更新可能（既読フラグ）
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ユーザーは自分の通知のみ削除可能
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================
-- my_bests テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーがマイベストを閲覧可能
CREATE POLICY "Anyone can view my bests" ON my_bests
  FOR SELECT
  USING (true);

-- ユーザーは自分のマイベストのみ作成可能
CREATE POLICY "Users can create their own my bests" ON my_bests
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ユーザーは自分のマイベストのみ更新可能
CREATE POLICY "Users can update their own my bests" ON my_bests
  FOR UPDATE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
  WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ユーザーは自分のマイベストのみ削除可能
CREATE POLICY "Users can delete their own my bests" ON my_bests
  FOR DELETE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================
-- user_badges テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーがバッジを閲覧可能
CREATE POLICY "Anyone can view user badges" ON user_badges
  FOR SELECT
  USING (true);

-- システムがバッジを作成（アプリケーション側から）
CREATE POLICY "System can create user badges" ON user_badges
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- prefecture_badges テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーが都道府県バッジを閲覧可能
CREATE POLICY "Anyone can view prefecture badges" ON prefecture_badges
  FOR SELECT
  USING (true);

-- システムが都道府県バッジを作成・更新
CREATE POLICY "System can manage prefecture badges" ON prefecture_badges
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- feedbacks テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーがフィードバックを閲覧可能
CREATE POLICY "Anyone can view feedbacks" ON feedbacks
  FOR SELECT
  USING (true);

-- 認証済みユーザーがフィードバックを作成可能
CREATE POLICY "Authenticated users can create feedbacks" ON feedbacks
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- 管理者のみフィードバックを更新可能
CREATE POLICY "Admins can update feedbacks" ON feedbacks
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = true)
  );

-- =====================================================
-- feedback_steams テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーがフィードバック共感を閲覧可能
CREATE POLICY "Anyone can view feedback steams" ON feedback_steams
  FOR SELECT
  USING (true);

-- 認証済みユーザーが共感を作成可能
CREATE POLICY "Authenticated users can create steams" ON feedback_steams
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ユーザーは自分の共感のみ削除可能
CREATE POLICY "Users can delete their own steams" ON feedback_steams
  FOR DELETE
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- =====================================================
-- app_settings テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーがアプリ設定を閲覧可能
CREATE POLICY "Anyone can view app settings" ON app_settings
  FOR SELECT
  USING (true);

-- 管理者のみアプリ設定を更新可能
CREATE POLICY "Admins can update app settings" ON app_settings
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = true)
  );

-- =====================================================
-- stations テーブルのRLSポリシー
-- =====================================================

-- 全ユーザーが駅マスタを閲覧可能
CREATE POLICY "Anyone can view stations" ON stations
  FOR SELECT
  USING (true);

-- 認証済みユーザーが駅を作成可能
CREATE POLICY "Authenticated users can create stations" ON stations
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (registered_by IS NULL OR registered_by IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  );

-- =====================================================
-- 完了メッセージ
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Row Level Security (RLS) Policies created successfully!';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Test RLS policies with different users';
  RAISE NOTICE '   2. Run 03_seed_data.sql to populate initial data (optional)';
  RAISE NOTICE '   3. Create Storage bucket policies for noodle-images';
END $$;
