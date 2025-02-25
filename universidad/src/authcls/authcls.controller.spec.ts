import { Test, TestingModule } from '@nestjs/testing';
import { AuthclsController } from './authcls.controller';

describe('AuthclsController', () => {
  let controller: AuthclsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthclsController],
    }).compile();

    controller = module.get<AuthclsController>(AuthclsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
