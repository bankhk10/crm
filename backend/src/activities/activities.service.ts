import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  create(createActivityDto: CreateActivityDto, user: any) {
    return this.prisma.activity.create({
      data: {
        ...createActivityDto,
        createdById: user.userId,
        department: user.department || null,
      },
    });
  }

  findAll(user: any) {
    if (user.role?.name === 'ADMIN') {
      return this.prisma.activity.findMany();
    }
    if (user.role?.name === 'MANAGER') {
      return this.prisma.activity.findMany({
        where: { department: user.department || undefined },
      });
    }
    return this.prisma.activity.findMany({ where: { createdById: user.userId } });
  }

  async findOne(id: number, user: any) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) throw new NotFoundException('Activity not found');
    if (this.canAccess(activity, user)) return activity;
    throw new ForbiddenException('Access denied');
  }

  async update(id: number, updateActivityDto: UpdateActivityDto, user: any) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) throw new NotFoundException('Activity not found');
    if (!this.canAccess(activity, user)) throw new ForbiddenException('Access denied');
    return this.prisma.activity.update({ where: { id }, data: updateActivityDto });
  }

  async remove(id: number, user: any) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) throw new NotFoundException('Activity not found');
    if (!this.canAccess(activity, user)) throw new ForbiddenException('Access denied');
    return this.prisma.activity.delete({ where: { id } });
  }

  private canAccess(activity: any, user: any) {
    if (user.role?.name === 'ADMIN') return true;
    if (user.role?.name === 'MANAGER' && activity.department === user.department) return true;
    return activity.createdById === user.userId;
  }
}
