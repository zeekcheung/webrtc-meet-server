import { Test, TestingModule } from '@nestjs/testing';
import { SignalGateway } from './signal.gateway';

describe('SignalGateway', () => {
  let gateway: SignalGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignalGateway],
    }).compile();

    gateway = module.get<SignalGateway>(SignalGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
