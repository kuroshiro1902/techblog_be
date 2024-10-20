import { ENVIRONMENT } from '@/common/environments/environment';
import { v2 as Cloudinary } from 'cloudinary';

// Cấu hình Cloudinary với thông tin của bạn
Cloudinary.config({
  cloud_name: ENVIRONMENT.CLOUDINARY_NAME,
  api_key: ENVIRONMENT.CLOUDINARY_API_KEY,
  api_secret: ENVIRONMENT.CLOUDINARY_API_SECRET,
});

export default Cloudinary;
