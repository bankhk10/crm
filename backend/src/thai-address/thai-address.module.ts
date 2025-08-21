import { Module } from '@nestjs/common';
import { ThaiAddressService } from './thai-address.service';
import { ThaiAddressController } from './thai-address.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ThaiAddressService],
  controllers: [ThaiAddressController],
})
export class ThaiAddressModule {}
