import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThaiAddressService {
  constructor(private prisma: PrismaService) {}

  provinces() {
    return this.prisma.province.findMany({ orderBy: { id: 'asc' } });
  }

  amphures(provinceId: number) {
    return this.prisma.amphure.findMany({
      where: { province_id: provinceId },
      orderBy: { id: 'asc' },
    });
  }

  tambons(amphureId: number) {
    return this.prisma.tambon.findMany({
      where: { amphure_id: amphureId },
      orderBy: { id: 'asc' },
    });
  }
}
