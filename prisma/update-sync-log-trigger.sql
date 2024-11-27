CREATE OR REPLACE FUNCTION post_sync_trigger_function()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Kiểm tra xem PostLog đã tồn tại chưa
      IF EXISTS (
        SELECT 1 FROM "PostLog" WHERE "postId" = COALESCE(NEW.id, OLD.id)
      ) THEN
        -- Nếu đã tồn tại, chỉ cập nhật status và updatedAt
        UPDATE "PostLog"
        SET 
          "status" = 'NEED_SYNC',
          "updatedAt" = NOW()
        WHERE "postId" = COALESCE(NEW.id, OLD.id);
      ELSE
        -- Nếu chưa tồn tại, tạo mới
        INSERT INTO "PostLog" ("postId", "status", "createdAt", "updatedAt")
        VALUES (
          COALESCE(NEW.id, OLD.id),
          'NOT_SYNCED',
          NOW(),
          NOW()
        );
      END IF;
      
      RETURN COALESCE(NEW, OLD);
    END;
    $$ LANGUAGE plpgsql;

    -- Xóa trigger cũ nếu tồn tại
    DROP TRIGGER IF EXISTS post_sync_trigger ON "Post";

    -- Tạo trigger mới
    CREATE TRIGGER post_sync_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Post"
    FOR EACH ROW
    EXECUTE FUNCTION post_sync_trigger_function();