import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CategoriesService } from '@services/categories.service';
import { ProductsService } from '@services/products.service';
import { FilterProductsDto } from '@dtos/product.dto';
import { UpdateCategoryDto } from '@dtos/category.dto';
import { CreateCategoryDto } from '@dtos/category.dto';
import { FilterCategoriesDto } from '@dtos/category.dto';
import { RolesGuard } from '@guards/role.guard';
import { Roles } from '@decorators/roles.decorator';
import { Role } from '@models/roles';

@ApiTags('categories')
@UseGuards(RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
  ) {}

  @Get()
  getAll(@Query() params: FilterCategoriesDto) {
    return this.categoriesService.getAll(params);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @Roles(Role.admin)
  create(@Body() category: CreateCategoryDto) {
    return this.categoriesService.create(category);
  }

  @Get(':id/products')
  getProductsByCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query() params: FilterProductsDto,
  ) {
    return this.productsService.byCategory(id, params);
  }

  @Put(':id')
  @Roles(Role.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, changes);
  }

  @Delete(':id')
  @Roles(Role.admin)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.delete(id);
  }
}
