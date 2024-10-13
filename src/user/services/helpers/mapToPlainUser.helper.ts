import User from '@/user/models/user';

export const mapToPlainUser = (user: User.UserModel): User.TUser => user.get({ plain: true });
