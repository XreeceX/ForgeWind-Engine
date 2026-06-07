import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthenticatedForgeWindUser } from '../auth/jwt.strategy';

const mockCurrentUser: AuthenticatedForgeWindUser = {
  id: 'user-1',
  externalUserId: 'ext-user-1',
  email: 'test@forgewind.dev',
  role: 'FREE',
};

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    upsertFromGithub: jest.fn(),
    findByIdWithRepos: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get(UsersController);
    jest.clearAllMocks();
  });

  it('returns own profile when id matches authenticated user', async () => {
    const profile = { id: 'user-1', username: 'dev' };
    usersService.findByIdWithRepos.mockResolvedValue(profile);

    await expect(controller.getProfile('user-1', mockCurrentUser)).resolves.toEqual(profile);
    expect(usersService.findByIdWithRepos).toHaveBeenCalledWith('user-1');
  });

  it('returns own profile when id does not match authenticated user (ownership enforcement)', async () => {
    const profile = { id: 'user-1', username: 'dev' };
    usersService.findByIdWithRepos.mockResolvedValue(profile);

    await expect(controller.getProfile('other-user-id', mockCurrentUser)).resolves.toEqual(profile);
    expect(usersService.findByIdWithRepos).toHaveBeenCalledWith('user-1');
  });
});
