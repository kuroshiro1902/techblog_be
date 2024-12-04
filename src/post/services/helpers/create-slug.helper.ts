import slugify from 'slugify';
import { uid } from 'uid';

export const createSlug = (title: string, slugUidLength = 10) => {
  const baseSlug = slugify(title || 'untitled', {
    trim: true,
    strict: true,
    locale: 'vi',
  });

  return (baseSlug || 'untitled')
    .substring(0, 255 - slugUidLength - 1) +
    '-' +
    uid(slugUidLength);
};
