import { Controller, Get, Query } from '@nestjs/common';
import { ThaiAddressService } from './thai-address.service';

@Controller('thai-address')
export class ThaiAddressController {
  constructor(private readonly service: ThaiAddressService) {}

  @Get('provinces')
  getProvinces() {
    return this.service.provinces();
  }

  @Get('amphures')
  getAmphures(@Query('provinceId') provinceId: string) {
    return this.service.amphures(Number(provinceId));
  }

  @Get('tambons')
  getTambons(@Query('amphureId') amphureId: string) {
    return this.service.tambons(Number(amphureId));
  }
}
