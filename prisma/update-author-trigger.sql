CREATE OR REPLACE FUNCTION author_update_trigger_function()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Kiểm tra xem name hoặc avatarUrl có thay đổi không
      IF (OLD.name <> NEW.name) OR 
         (OLD."avatarUrl" IS NULL AND NEW."avatarUrl" IS NOT NULL) OR
         (OLD."avatarUrl" IS NOT NULL AND NEW."avatarUrl" IS NULL) OR
         (OLD."avatarUrl" <> NEW."avatarUrl") THEN
        
        -- Cập nhật status của PostLog cho tất cả bài viết của user này
        UPDATE "PostLog"
        SET 
          "status" = 'NEED_SYNC',
          "updatedAt" = NOW()
        FROM "Post"
        WHERE 
          "Post"."authorId" = NEW.id AND
          "PostLog"."postId" = "Post".id;
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

-- Xóa trigger cũ nếu tồn tại
DROP TRIGGER IF EXISTS author_update_trigger ON "User";

-- Tạo trigger mới
CREATE TRIGGER author_update_trigger
    AFTER UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION author_update_trigger_function(); 