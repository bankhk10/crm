import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  // This method now fetches the full user object, including the password.
  // The password will be stripped out in the controller for security.
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  
  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findOneByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: { role: true } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.roleId && updateUserDto.roleId !== userToUpdate.roleId) {
      const adminRole = await this.prisma.role.findUnique({ where: { name: 'ADMIN' } });
      if (userToUpdate.roleId === adminRole?.id) {
        const adminCount = await this.prisma.user.count({ where: { roleId: adminRole.id } });
        if (adminCount <= 1) {
          throw new BadRequestException('Cannot change the role of the last admin.');
        }
      }
    }

    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    } else {
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async remove(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new ForbiddenException('You cannot delete your own account.');
    }

    const userToDelete = await this.prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const adminRole = await this.prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (userToDelete.roleId === adminRole?.id) {
      const adminCount = await this.prisma.user.count({ where: { roleId: adminRole.id } });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin.');
      }
    }

    return this.prisma.user.delete({ where: { id } });
  }
}