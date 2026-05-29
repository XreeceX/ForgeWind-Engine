import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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

  it('returns user profile by id', async () => {
    const profile = { id: 'user-1', username: 'dev' };
    usersService.findByIdWithRepos.mockResolvedValue(profile);

    await expect(controller.getProfile('user-1')).resolves.toEqual(profile);
    expect(usersService.findByIdWithRepos).toHaveBeenCalledWith('user-1');
  });
});
