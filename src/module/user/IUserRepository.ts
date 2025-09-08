export interface IUserRepository {
  create(email: string, password: string): Promise<void>;
  findByEmail(
    email: string,
  ): Promise<{ email: string; password: string } | null>;
}
