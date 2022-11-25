import { Either } from 'fp-ts/Either';
import { either } from 'fp-ts';

class InvalidAdminCredentialsError extends Error {
  public constructor(username: string, password: string) {
    super(`Invalid admin login attempt! Username '${username}' and password '${password}' do not match records!`);
  }
}

export const validateAdmin = async (
  username: string,
  password: string,
): Promise<Either<InvalidAdminCredentialsError, null>> => {
  if (username !== process.env.APP_ADMIN_USERNAME && password !== process.env.APP_ADMIN_PASSWORD) {
    return either.left(new InvalidAdminCredentialsError(username, password));
  }
  return either.right(null);
};
