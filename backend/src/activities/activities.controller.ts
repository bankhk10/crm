import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'USER')
  create(@Request() req, @Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.create(createActivityDto, req.user);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'USER')
  findAll(@Request() req) {
    return this.activitiesService.findAll(req.user);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'USER')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'USER')
  update(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() updateActivityDto: UpdateActivityDto) {
    return this.activitiesService.update(id, updateActivityDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER', 'USER')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.remove(id, req.user);
  }
}
